package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TicketCategory;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AutoAssignmentService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public AutoAssignmentService(UserRepository userRepository, TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    /**
     * Finds the best maintenance user for a given ticket based on:
     * 1. Lowest active workload (fewest non-resolved/closed tickets)
     * Returns empty if no maintenance users exist.
     */
    @Transactional(readOnly = true)
    public Optional<User> findBestAssignee(Ticket ticket) {
        List<User> maintenanceUsers = userRepository.findByRole(Role.MAINTENANCE);
        if (maintenanceUsers.isEmpty()) {
            return Optional.empty();
        }

        return maintenanceUsers.stream()
                .min(Comparator.comparingLong(user -> getActiveTicketCount(user.getId())));
    }

    private long getActiveTicketCount(Long userId) {
        long total = ticketRepository.countByAssignedToId(userId);
        long resolved = ticketRepository.countByAssignedToIdAndStatusIn(userId,
                java.util.EnumSet.of(TicketStatus.RESOLVED, TicketStatus.CLOSED));
        return total - resolved;
    }
}
