package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.NotificationType;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.util.EnumSet;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class EscalationScheduler {

    private static final Logger log = LoggerFactory.getLogger(EscalationScheduler.class);

    private final TicketRepository ticketRepository;
    private final SlaService slaService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public EscalationScheduler(
            TicketRepository ticketRepository,
            SlaService slaService,
            NotificationService notificationService,
            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.slaService = slaService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    /**
     * Runs every 30 minutes. Finds open tickets that have breached their SLA,
     * bumps urgency if not already CRITICAL, and notifies all admins.
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes
    @Transactional
    public void escalateBreachedTickets() {
        EnumSet<TicketStatus> activeStatuses = EnumSet.of(
                TicketStatus.SUBMITTED, TicketStatus.APPROVED,
                TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS);

        List<Ticket> activeTickets = ticketRepository.findAll().stream()
                .filter(t -> activeStatuses.contains(t.getStatus()))
                .filter(slaService::isSlaBreached)
                .toList();

        if (activeTickets.isEmpty())
            return;

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        int escalated = 0;

        for (Ticket ticket : activeTickets) {
            UrgencyLevel current = ticket.getUrgency();
            UrgencyLevel escalatedLevel = bumpUrgency(current);

            if (escalatedLevel != current) {
                ticket.setUrgency(escalatedLevel);
                ticketRepository.save(ticket);
                escalated++;

                for (User admin : admins) {
                    notificationService.notify(admin,
                            "SLA Breach: Ticket #" + ticket.getId(),
                            "Ticket \"" + ticket.getTitle() + "\" has breached SLA. Urgency escalated from "
                                    + current + " to " + escalatedLevel + ".",
                            NotificationType.SLA_BREACH,
                            "/tickets/" + ticket.getId());
                }
            }
        }

        if (escalated > 0) {
            log.info("Escalated {} tickets due to SLA breach", escalated);
        }
    }

    private UrgencyLevel bumpUrgency(UrgencyLevel current) {
        return switch (current) {
            case LOW -> UrgencyLevel.MEDIUM;
            case MEDIUM -> UrgencyLevel.HIGH;
            case HIGH -> UrgencyLevel.CRITICAL;
            case CRITICAL -> UrgencyLevel.CRITICAL;
        };
    }
}
