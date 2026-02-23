package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.user.BroadcastAudience;
import com.smartcampus.maintenance.dto.user.BroadcastMessageRequest;
import com.smartcampus.maintenance.dto.user.BroadcastMessageResponse;
import com.smartcampus.maintenance.dto.user.StaffInviteRequest;
import com.smartcampus.maintenance.dto.user.StaffInviteResponse;
import com.smartcampus.maintenance.dto.user.UserProfileResponse;
import com.smartcampus.maintenance.dto.user.UserProfileUpdateRequest;
import com.smartcampus.maintenance.dto.user.UserSummaryResponse;
import com.smartcampus.maintenance.dto.user.UserWithTicketCountResponse;
import com.smartcampus.maintenance.entity.StaffInvite;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.NotificationType;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.ConflictException;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.mapper.UserMapper;
import com.smartcampus.maintenance.repository.StaffInviteRepository;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final StaffInviteRepository staffInviteRepository;
    private final UsernameSuggestionService usernameSuggestionService;
    private final TokenHashService tokenHashService;
    private final EmailService emailService;
    private final NotificationDispatchService notificationDispatchService;
    private final String frontendBaseUrl;
    private final long staffInviteTtlHours;

    public UserService(
            UserRepository userRepository,
            TicketRepository ticketRepository,
            StaffInviteRepository staffInviteRepository,
            UsernameSuggestionService usernameSuggestionService,
            TokenHashService tokenHashService,
            EmailService emailService,
            NotificationDispatchService notificationDispatchService,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
            @Value("${app.auth.staff-invite-ttl-hours:48}") long staffInviteTtlHours) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.staffInviteRepository = staffInviteRepository;
        this.usernameSuggestionService = usernameSuggestionService;
        this.tokenHashService = tokenHashService;
        this.emailService = emailService;
        this.notificationDispatchService = notificationDispatchService;
        this.frontendBaseUrl = frontendBaseUrl;
        this.staffInviteTtlHours = Math.max(1, staffInviteTtlHours);
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

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(User actor) {
        return toProfile(actor);
    }

    @Transactional
    public UserProfileResponse updateMyProfile(User actor, UserProfileUpdateRequest request) {
        actor.setFullName(request.fullName().trim());
        User saved = userRepository.save(actor);
        return toProfile(saved);
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
    public StaffInviteResponse inviteStaffUser(User actor, StaffInviteRequest request) {
        requireAdmin(actor);

        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        String fullName = request.fullName().trim();

        if (isUsernameUnavailable(username)) {
            List<String> suggestions = suggestAvailableUsernames(username, fullName, 5);
            throw new ConflictException("Username is already taken. Try: " + String.join(", ", suggestions));
        }
        if (isEmailUnavailable(email)) {
            throw new ConflictException("Email is already registered or has a pending invitation.");
        }

        String rawToken = tokenHashService.generateUrlToken(32);
        StaffInvite invite = new StaffInvite();
        invite.setTokenHash(tokenHashService.hashSha256(rawToken));
        invite.setUsername(username);
        invite.setEmail(email);
        invite.setFullName(fullName);
        invite.setInvitedBy(actor);
        invite.setExpiresAt(LocalDateTime.now().plusHours(staffInviteTtlHours));
        invite = staffInviteRepository.save(invite);

        emailService.sendStaffInviteEmail(fullName, email, buildInviteUrl(rawToken), staffInviteTtlHours);

        return new StaffInviteResponse(
                invite.getId(),
                invite.getUsername(),
                invite.getEmail(),
                invite.getFullName(),
                invite.getExpiresAt());
    }

    @Transactional
    public BroadcastMessageResponse broadcastMessage(User actor, BroadcastMessageRequest request) {
        requireAdmin(actor);

        String title = request.title().trim();
        String message = request.message().trim();
        BroadcastAudience audience = request.audience() == null ? BroadcastAudience.ALL : request.audience();

        List<User> rawRecipients = switch (audience) {
            case ALL -> userRepository.findAll();
            case STUDENTS -> userRepository.findByRole(Role.STUDENT);
            case STAFF -> Stream.concat(
                    userRepository.findByRole(Role.ADMIN).stream(),
                    userRepository.findByRole(Role.MAINTENANCE).stream())
                    .toList();
        };

        List<User> recipients = rawRecipients.stream()
                .filter(user -> user.getId() != null && !user.getId().equals(actor.getId()))
                .toList();

        notificationDispatchService.notifyUsers(
                recipients,
                "Broadcast: " + title,
                message,
                NotificationType.ANNOUNCEMENT,
                "/announcements");

        return new BroadcastMessageResponse(
                title,
                audience.name(),
                recipients.size(),
                LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<String> suggestAvailableUsernames(String preferredUsername, String fullName, int limit) {
        int safeLimit = Math.max(1, limit);
        List<String> candidates = usernameSuggestionService.generate(preferredUsername, fullName, safeLimit * 2);
        List<String> available = candidates.stream()
                .filter(candidate -> !isUsernameUnavailable(candidate))
                .limit(safeLimit)
                .toList();
        if (!available.isEmpty()) {
            return available;
        }
        return candidates.stream().limit(safeLimit).toList();
    }

    @Transactional(readOnly = true)
    public boolean isUsernameUnavailable(String username) {
        String normalized = username == null ? "" : username.trim();
        if (normalized.isEmpty()) {
            return true;
        }
        return userRepository.existsByUsernameIgnoreCase(normalized)
                || staffInviteRepository.existsByUsernameIgnoreCaseAndUsedFalse(normalized);
    }

    @Transactional(readOnly = true)
    public boolean isEmailUnavailable(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        if (normalized.isEmpty()) {
            return true;
        }
        return userRepository.existsByEmailIgnoreCase(normalized)
                || staffInviteRepository.existsByEmailIgnoreCaseAndUsedFalse(normalized);
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }

    private String buildInviteUrl(String token) {
        return UriComponentsBuilder
                .fromUriString(frontendBaseUrl)
                .path("/accept-invite")
                .queryParam("token", token)
                .build()
                .toUriString();
    }

    private UserProfileResponse toProfile(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getCreatedAt());
    }
}
