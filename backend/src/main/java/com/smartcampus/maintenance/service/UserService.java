package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.user.CreateStaffRequest;
import com.smartcampus.maintenance.dto.user.UserSummaryResponse;
import com.smartcampus.maintenance.dto.user.UserWithTicketCountResponse;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.ConflictException;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.mapper.UserMapper;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String frontendBaseUrl;

    public UserService(UserRepository userRepository, TicketRepository ticketRepository,
            PasswordEncoder passwordEncoder, EmailService emailService,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.frontendBaseUrl = frontendBaseUrl;
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

    @Transactional
    public UserSummaryResponse createStaffUser(User actor, CreateStaffRequest request) {
        requireAdmin(actor);

        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        String fullName = request.fullName().trim();

        if (userRepository.existsByUsername(username)) {
            throw new ConflictException("Username '" + username + "' is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email '" + email + "' is already registered");
        }
        User staff = new User();
        staff.setUsername(username);
        staff.setEmail(email);
        staff.setFullName(fullName);
        staff.setRole(Role.MAINTENANCE);
        staff.setEmailVerified(true);
        staff.setPasswordHash(passwordEncoder.encode(request.password()));
        staff = userRepository.save(staff);
        emailService.sendWelcomeEmail(staff.getFullName(), staff.getEmail(), buildLoginUrl());
        return UserMapper.toSummary(staff);
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }

    private String buildLoginUrl() {
        return UriComponentsBuilder
                .fromUriString(frontendBaseUrl)
                .path("/login")
                .build()
                .toUriString();
    }
}
