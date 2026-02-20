package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.analytics.SlaComplianceResponse;
import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.repository.TicketRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SlaService {

    // SLA thresholds in hours per urgency level
    private static final Map<UrgencyLevel, Long> SLA_HOURS = new EnumMap<>(Map.of(
            UrgencyLevel.CRITICAL, 4L,
            UrgencyLevel.HIGH, 24L,
            UrgencyLevel.MEDIUM, 72L,
            UrgencyLevel.LOW, 168L));

    private static final EnumSet<TicketStatus> RESOLVED_STATUSES = EnumSet.of(TicketStatus.RESOLVED,
            TicketStatus.CLOSED);

    private final TicketRepository ticketRepository;

    public SlaService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public SlaComplianceResponse getSlaCompliance(User actor) {
        requireAdmin(actor);
        List<Ticket> resolved = ticketRepository.findAll().stream()
                .filter(t -> RESOLVED_STATUSES.contains(t.getStatus()))
                .filter(t -> t.getResolvedAt() != null)
                .toList();

        long total = resolved.size();
        long onTime = resolved.stream().filter(this::isOnTime).count();
        long breached = total - onTime;
        double compliancePct = total == 0 ? 100.0 : Math.round((onTime * 100.0 / total) * 100.0) / 100.0;
        double avgHours = resolved.stream()
                .mapToDouble(t -> Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMinutes() / 60.0)
                .average().orElse(0.0);

        return new SlaComplianceResponse(
                total, onTime, breached, compliancePct,
                Math.round(avgHours * 100.0) / 100.0,
                SLA_HOURS.get(UrgencyLevel.CRITICAL),
                SLA_HOURS.get(UrgencyLevel.HIGH),
                SLA_HOURS.get(UrgencyLevel.MEDIUM),
                SLA_HOURS.get(UrgencyLevel.LOW));
    }

    public boolean isSlaBreached(Ticket ticket) {
        Long slaHours = SLA_HOURS.get(ticket.getUrgency());
        if (slaHours == null)
            return false;
        LocalDateTime deadline = ticket.getCreatedAt().plusHours(slaHours);
        if (ticket.getResolvedAt() != null) {
            return ticket.getResolvedAt().isAfter(deadline);
        }
        return LocalDateTime.now().isAfter(deadline);
    }

    private boolean isOnTime(Ticket ticket) {
        return !isSlaBreached(ticket);
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }
}
