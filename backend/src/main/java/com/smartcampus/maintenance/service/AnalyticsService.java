package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.analytics.AnalyticsSummaryResponse;
import com.smartcampus.maintenance.dto.analytics.CategoryResolutionTimeResponse;
import com.smartcampus.maintenance.dto.analytics.CrewPerformanceResponse;
import com.smartcampus.maintenance.dto.analytics.ResolutionTimeResponse;
import com.smartcampus.maintenance.dto.analytics.TopBuildingResponse;
import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.repository.TicketRepository;
import java.time.Duration;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {

    private static final EnumSet<TicketStatus> RESOLVED_STATUSES = EnumSet.of(TicketStatus.RESOLVED, TicketStatus.CLOSED);

    private final TicketRepository ticketRepository;

    public AnalyticsService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(User actor) {
        requireAdmin(actor);
        List<Ticket> tickets = ticketRepository.findAll();

        Map<String, Long> byStatus = tickets.stream()
            .collect(Collectors.groupingBy(ticket -> ticket.getStatus().name(), Collectors.counting()));
        Map<String, Long> byCategory = tickets.stream()
            .collect(Collectors.groupingBy(ticket -> ticket.getCategory().name(), Collectors.counting()));
        Map<String, Long> byUrgency = tickets.stream()
            .collect(Collectors.groupingBy(ticket -> ticket.getUrgency().name(), Collectors.counting()));

        return new AnalyticsSummaryResponse(tickets.size(), byStatus, byCategory, byUrgency);
    }

    @Transactional(readOnly = true)
    public ResolutionTimeResponse getResolutionTime(User actor) {
        requireAdmin(actor);
        List<Ticket> resolvedTickets = ticketRepository.findAll().stream()
            .filter(ticket -> RESOLVED_STATUSES.contains(ticket.getStatus()))
            .filter(ticket -> ticket.getResolvedAt() != null)
            .toList();

        double overall = averageHours(resolvedTickets);
        List<CategoryResolutionTimeResponse> byCategory = resolvedTickets.stream()
            .collect(Collectors.groupingBy(ticket -> ticket.getCategory().name()))
            .entrySet()
            .stream()
            .map(entry -> new CategoryResolutionTimeResponse(
                entry.getKey(),
                round(averageHours(entry.getValue())),
                entry.getValue().size()
            ))
            .sorted(Comparator.comparing(CategoryResolutionTimeResponse::category))
            .toList();

        return new ResolutionTimeResponse(round(overall), byCategory);
    }

    @Transactional(readOnly = true)
    public List<TopBuildingResponse> getTopBuildings(User actor) {
        requireAdmin(actor);
        return ticketRepository.countByBuilding().stream()
            .limit(10)
            .map(row -> new TopBuildingResponse((String) row[0], (Long) row[1]))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CrewPerformanceResponse> getCrewPerformance(User actor) {
        requireAdmin(actor);
        return ticketRepository.crewPerformance(RESOLVED_STATUSES).stream()
            .map(row -> new CrewPerformanceResponse(
                (Long) row[0],
                (String) row[1],
                (String) row[2],
                (Long) row[3]
            ))
            .toList();
    }

    private double averageHours(List<Ticket> tickets) {
        if (tickets.isEmpty()) {
            return 0.0;
        }
        return tickets.stream()
            .map(ticket -> Duration.between(ticket.getCreatedAt(), Objects.requireNonNull(ticket.getResolvedAt())).toMinutes() / 60.0)
            .collect(Collectors.averagingDouble(Double::doubleValue));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }
}
