package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.ticket.TicketAssignmentRecommendationResponse;
import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.mapper.TicketMapper;
import com.smartcampus.maintenance.nativeopt.AssignmentCandidateMetrics;
import com.smartcampus.maintenance.nativeopt.NativeOptimizationGateway;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AutoAssignmentService {

    private static final EnumSet<TicketStatus> RESOLVED_OR_CLOSED = EnumSet.of(
            TicketStatus.RESOLVED,
            TicketStatus.CLOSED);
    private static final int DEFAULT_RECOMMENDATION_LIMIT = 3;
    private static final int RECENT_RESOLUTION_WINDOW_DAYS = 30;
    private static final double WORKLOAD_WEIGHT = 55.0;
    private static final double SERVICE_DOMAIN_WEIGHT = 12.0;
    private static final double BUILDING_WEIGHT = 7.5;
    private static final double RECENT_RESOLUTION_WEIGHT = 10.0;

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final NativeOptimizationGateway nativeOptimizationGateway;

    public AutoAssignmentService(
            UserRepository userRepository,
            TicketRepository ticketRepository,
            NativeOptimizationGateway nativeOptimizationGateway) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.nativeOptimizationGateway = nativeOptimizationGateway;
    }

    @Transactional(readOnly = true)
    public List<TicketAssignmentRecommendationResponse> recommendAssignees(Ticket ticket, int limit) {
        if (ticket == null) {
            return List.of();
        }

        List<AssignmentCandidateMetrics> candidates = userRepository.findByRoleOrderByFullNameAsc(Role.MAINTENANCE)
                .stream()
                .map(user -> buildCandidateMetrics(ticket, user))
                .toList();
        if (candidates.isEmpty()) {
            return List.of();
        }

        Map<Long, Double> nativeScores = nativeOptimizationGateway.scoreCandidates(candidates)
                .filter(scores -> scores.length == candidates.size())
                .map(scores -> mapScores(candidates, scores))
                .orElseGet(Map::of);

        int safeLimit = Math.max(1, limit);
        int lowestActiveWorkload = candidates.stream()
                .mapToInt(AssignmentCandidateMetrics::activeOpenTickets)
                .min()
                .orElse(0);

        return candidates.stream()
                .map(candidate -> toRecommendation(
                        candidate,
                        nativeScores.getOrDefault(candidate.userId(), scoreCandidate(candidate)),
                        lowestActiveWorkload))
                .sorted(Comparator
                        .comparingDouble(TicketAssignmentRecommendationResponse::score)
                        .reversed()
                        .thenComparing(TicketAssignmentRecommendationResponse::fullName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(TicketAssignmentRecommendationResponse::userId))
                .limit(safeLimit)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<User> findBestAssignee(Ticket ticket) {
        return recommendAssignees(ticket, 1).stream()
                .map(TicketAssignmentRecommendationResponse::userId)
                .flatMap(userId -> userRepository.findById(userId).stream())
                .findFirst();
    }

    @Transactional(readOnly = true)
    public Optional<User> findBestAssigneeWithinCapacity(Ticket ticket, int maxActiveOpenTickets) {
        if (ticket == null) {
            return Optional.empty();
        }

        List<AssignmentCandidateMetrics> candidates = userRepository.findByRoleOrderByFullNameAsc(Role.MAINTENANCE)
                .stream()
                .map(user -> buildCandidateMetrics(ticket, user))
                .toList();
        if (candidates.isEmpty()) {
            return Optional.empty();
        }

        Map<Long, Double> nativeScores = nativeOptimizationGateway.scoreCandidates(candidates)
                .filter(scores -> scores.length == candidates.size())
                .map(scores -> mapScores(candidates, scores))
                .orElseGet(Map::of);

        return candidates.stream()
                .filter(candidate -> candidate.activeOpenTickets() <= maxActiveOpenTickets)
                .sorted(Comparator
                        .comparingDouble((AssignmentCandidateMetrics candidate) -> nativeScores
                                .getOrDefault(candidate.userId(), scoreCandidate(candidate)))
                        .reversed()
                        .thenComparing(AssignmentCandidateMetrics::fullName, String.CASE_INSENSITIVE_ORDER))
                .map(AssignmentCandidateMetrics::userId)
                .flatMap(userId -> userRepository.findById(userId).stream())
                .findFirst();
    }

    private AssignmentCandidateMetrics buildCandidateMetrics(Ticket ticket, User user) {
        String serviceDomainKey = TicketMapper.resolveServiceDomainKey(ticket);
        LocalDateTime recentThreshold = LocalDateTime.now().minusDays(RECENT_RESOLUTION_WINDOW_DAYS);

        long totalAssigned = ticketRepository.countByAssignedToId(user.getId());
        long resolvedOrClosed = ticketRepository.countByAssignedToIdAndStatusIn(user.getId(), RESOLVED_OR_CLOSED);
        int activeOpenTickets = Math.toIntExact(Math.max(0L, totalAssigned - resolvedOrClosed));

        int sameDomainResolvedTickets = StringUtils.hasText(serviceDomainKey)
                ? Math.toIntExact(ticketRepository.countByAssignedToIdAndRequestType_ServiceDomain_KeyAndStatusIn(
                        user.getId(),
                        serviceDomainKey,
                        RESOLVED_OR_CLOSED))
                : 0;

        int sameBuildingResolvedTickets = ticket.getBuildingRecord() != null
                ? Math.toIntExact(ticketRepository.countByAssignedToIdAndBuildingRecord_IdAndStatusIn(
                        user.getId(),
                        ticket.getBuildingRecord().getId(),
                        RESOLVED_OR_CLOSED))
                : 0;

        int recentResolvedTickets = Math.toIntExact(ticketRepository.countByAssignedToIdAndResolvedAtAfterAndStatusIn(
                user.getId(),
                recentThreshold,
                RESOLVED_OR_CLOSED));

        return new AssignmentCandidateMetrics(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                activeOpenTickets,
                sameDomainResolvedTickets,
                sameBuildingResolvedTickets,
                recentResolvedTickets);
    }

    private Map<Long, Double> mapScores(List<AssignmentCandidateMetrics> candidates, double[] scores) {
        return java.util.stream.IntStream.range(0, candidates.size())
                .boxed()
                .collect(Collectors.toMap(
                        index -> candidates.get(index).userId(),
                        index -> {
                            double score = scores[index];
                            return Double.isFinite(score) ? score : scoreCandidate(candidates.get(index));
                        }));
    }

    private TicketAssignmentRecommendationResponse toRecommendation(
            AssignmentCandidateMetrics candidate,
            double score,
            int lowestActiveWorkload) {
        return new TicketAssignmentRecommendationResponse(
                candidate.userId(),
                candidate.username(),
                candidate.fullName(),
                Math.round(score * 100.0) / 100.0,
                buildReasons(candidate, lowestActiveWorkload));
    }

    private List<String> buildReasons(AssignmentCandidateMetrics candidate, int lowestActiveWorkload) {
        java.util.ArrayList<String> reasons = new java.util.ArrayList<>();
        if (candidate.activeOpenTickets() == lowestActiveWorkload) {
            reasons.add("Lowest active workload in the current maintenance pool.");
        }
        if (candidate.sameDomainResolvedTickets() > 0) {
            reasons.add("Resolved %d similar %s tickets.".formatted(
                    candidate.sameDomainResolvedTickets(),
                    "service-domain"));
        }
        if (candidate.sameBuildingResolvedTickets() > 0) {
            reasons.add("Completed %d tickets in this building.".formatted(candidate.sameBuildingResolvedTickets()));
        }
        if (candidate.recentResolvedTickets() > 0) {
            reasons.add("Closed %d tickets in the last %d days.".formatted(
                    candidate.recentResolvedTickets(),
                    RECENT_RESOLUTION_WINDOW_DAYS));
        }
        if (reasons.isEmpty()) {
            reasons.add("Available maintenance crew member with no negative workload signal.");
        }
        return List.copyOf(reasons);
    }

    static double scoreCandidate(AssignmentCandidateMetrics candidate) {
        double workloadScore = WORKLOAD_WEIGHT / (1.0 + candidate.activeOpenTickets());
        double serviceDomainScore = SERVICE_DOMAIN_WEIGHT * Math.log1p(candidate.sameDomainResolvedTickets());
        double buildingScore = BUILDING_WEIGHT * Math.log1p(candidate.sameBuildingResolvedTickets());
        double recentResolutionScore = RECENT_RESOLUTION_WEIGHT * Math.log1p(candidate.recentResolvedTickets());
        return workloadScore + serviceDomainScore + buildingScore + recentResolutionScore;
    }
}
