package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.user.UserSummaryResponse;
import com.smartcampus.maintenance.dto.user.UserWithTicketCountResponse;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.mapper.UserMapper;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public UserService(UserRepository userRepository, TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public List<UserWithTicketCountResponse> getAllUsersWithTicketCount(User actor) {
        requireAdmin(actor);
        return userRepository.findAll().stream()
            .map(user -> UserMapper.toWithTicketCount(user, resolveTicketCount(user)))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getMaintenanceUsers(User actor) {
        requireAdmin(actor);
        return userRepository.findByRoleOrderByFullNameAsc(Role.MAINTENANCE).stream()
            .map(UserMapper::toSummary)
            .toList();
    }

    private long resolveTicketCount(User user) {
        if (user.getRole() == Role.STUDENT) {
            return ticketRepository.countByCreatedById(user.getId());
        }
        if (user.getRole() == Role.MAINTENANCE) {
            return ticketRepository.countByAssignedToId(user.getId());
        }
        return 0;
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }
}
