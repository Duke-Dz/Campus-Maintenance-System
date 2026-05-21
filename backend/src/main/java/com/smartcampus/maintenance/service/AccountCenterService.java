package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.user.UserAdminAccountUpdateRequest;
import com.smartcampus.maintenance.dto.user.UserNotificationPreferenceResponse;
import com.smartcampus.maintenance.dto.user.UserNotificationPreferenceUpdateItemRequest;
import com.smartcampus.maintenance.dto.user.UserNotificationPreferencesUpdateRequest;
import com.smartcampus.maintenance.dto.user.UserPreferencesResponse;
import com.smartcampus.maintenance.dto.user.UserPreferenceUpdateRequest;
import com.smartcampus.maintenance.dto.user.UserProfileResponse;
import com.smartcampus.maintenance.dto.user.UserProfileUpdateRequest;
import com.smartcampus.maintenance.dto.user.UserSessionResponse;
import com.smartcampus.maintenance.dto.user.UserWithTicketCountResponse;
import com.smartcampus.maintenance.entity.AuthRefreshToken;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.UserNotificationPreference;
import com.smartcampus.maintenance.entity.UserPreference;
import com.smartcampus.maintenance.exception.BadRequestException;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.exception.NotFoundException;
import com.smartcampus.maintenance.mapper.UserMapper;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserNotificationPreferenceRepository;
import com.smartcampus.maintenance.repository.UserPreferenceRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.util.FileStorageService;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AccountCenterService {

    private static final String DEFAULT_THEME = "light";
    private static final String DEFAULT_DENSITY = "comfortable";
    private static final String DEFAULT_TIMEZONE = "Africa/Nairobi";
    private static final String DEFAULT_LANGUAGE = "en";
    private static final List<String> ALLOWED_THEMES = List.of("light", "dark", "system");
    private static final List<String> ALLOWED_DENSITIES = List.of("comfortable", "compact");
    private static final List<String> ALLOWED_DELIVERY_MODES = List.of("instant", "digest", "mute");

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserNotificationPreferenceRepository userNotificationPreferenceRepository;
    private final BuildingService buildingService;
    private final AuthRefreshTokenService authRefreshTokenService;
    private final TokenHashService tokenHashService;
    private final FileStorageService fileStorageService;

    public AccountCenterService(
            UserRepository userRepository,
            TicketRepository ticketRepository,
            UserPreferenceRepository userPreferenceRepository,
            UserNotificationPreferenceRepository userNotificationPreferenceRepository,
            BuildingService buildingService,
            AuthRefreshTokenService authRefreshTokenService,
            TokenHashService tokenHashService,
            FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.userNotificationPreferenceRepository = userNotificationPreferenceRepository;
        this.buildingService = buildingService;
        this.authRefreshTokenService = authRefreshTokenService;
        this.tokenHashService = tokenHashService;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(User actor, String currentRefreshToken) {
        return toAccountResponse(actor, currentRefreshToken);
    }

    @Transactional
    public UserProfileResponse updateMyProfile(User actor, UserProfileUpdateRequest request, String currentRefreshToken) {
        actor.setFullName(request.fullName().trim());
        User saved = userRepository.save(actor);
        return toAccountResponse(saved, currentRefreshToken);
    }

    @Transactional(readOnly = true)
    public UserPreferencesResponse getMyPreferences(User actor) {
        return toPreferencesResponse(getOrCreatePreferences(actor));
    }

    @Transactional
    public UserPreferencesResponse updateMyPreferences(User actor, UserPreferenceUpdateRequest request) {
        UserPreference preferences = getOrCreatePreferences(actor);

        if (StringUtils.hasText(request.theme())) {
            preferences.setTheme(normalizeOption(request.theme(), ALLOWED_THEMES, DEFAULT_THEME));
        }
        if (StringUtils.hasText(request.density())) {
            preferences.setDensity(normalizeOption(request.density(), ALLOWED_DENSITIES, DEFAULT_DENSITY));
        }
        if (StringUtils.hasText(request.timezone())) {
            preferences.setTimezone(request.timezone().trim());
        }
        if (StringUtils.hasText(request.language())) {
            preferences.setLanguage(request.language().trim().toLowerCase(Locale.ROOT));
        }
        if (request.reduceMotion() != null) {
            preferences.setReduceMotion(request.reduceMotion());
        }
        if (request.sidebarCollapsedDefault() != null) {
            preferences.setSidebarCollapsedDefault(request.sidebarCollapsedDefault());
        }
        if (request.defaultLandingSection() != null) {
            preferences.setDefaultLandingSection(trimToNull(request.defaultLandingSection()));
        }
        if (request.rowsPerPage() != null) {
            preferences.setRowsPerPage(Math.max(5, Math.min(100, request.rowsPerPage())));
        }
        if (request.stickyFilters() != null) {
            preferences.setStickyFilters(request.stickyFilters());
        }
        if (request.rememberLastSearch() != null) {
            preferences.setRememberLastSearch(request.rememberLastSearch());
        }
        if (request.studentShowResolvedFirst() != null) {
            preferences.setStudentShowResolvedFirst(request.studentShowResolvedFirst());
        }
        if (StringUtils.hasText(request.maintenanceDefaultQueueSort())) {
            preferences.setMaintenanceDefaultQueueSort(request.maintenanceDefaultQueueSort().trim().toLowerCase(Locale.ROOT));
        }
        if (request.maintenanceShowOnlyActiveOnOpen() != null) {
            preferences.setMaintenanceShowOnlyActiveOnOpen(request.maintenanceShowOnlyActiveOnOpen());
        }
        if (request.maintenanceHighlightSlaBreaches() != null) {
            preferences.setMaintenanceHighlightSlaBreaches(request.maintenanceHighlightSlaBreaches());
        }
        if (StringUtils.hasText(request.adminDefaultAnalyticsRange())) {
            preferences.setAdminDefaultAnalyticsRange(request.adminDefaultAnalyticsRange().trim());
        }
        if (StringUtils.hasText(request.adminDefaultTicketScope())) {
            preferences.setAdminDefaultTicketScope(request.adminDefaultTicketScope().trim().toLowerCase(Locale.ROOT));
        }
        if (request.adminShowCriticalFirst() != null) {
            preferences.setAdminShowCriticalFirst(request.adminShowCriticalFirst());
        }
        if (request.quietHoursEnabled() != null) {
            preferences.setQuietHoursEnabled(request.quietHoursEnabled());
        }
        if (request.quietHoursStart() != null || !preferences.isQuietHoursEnabled()) {
            preferences.setQuietHoursStart(request.quietHoursStart());
        }
        if (request.quietHoursEnd() != null || !preferences.isQuietHoursEnabled()) {
            preferences.setQuietHoursEnd(request.quietHoursEnd());
        }

        UserPreference saved = userPreferenceRepository.save(preferences);
        return toPreferencesResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<UserNotificationPreferenceResponse> getMyNotificationPreferences(User actor) {
        return toNotificationResponses(actor, ensureNotificationPreferences(actor));
    }

    @Transactional
    public List<UserNotificationPreferenceResponse> updateMyNotificationPreferences(
            User actor,
            UserNotificationPreferencesUpdateRequest request) {
        List<UserNotificationPreference> preferences = ensureNotificationPreferences(actor);
        Map<String, UserNotificationPreference> byKey = new HashMap<>();
        preferences.forEach(item -> byKey.put(item.getEventKey(), item));

        if (request != null && request.items() != null) {
            for (UserNotificationPreferenceUpdateItemRequest item : request.items()) {
                if (item == null || !StringUtils.hasText(item.eventKey())) {
                    continue;
                }
                AccountPreferenceCatalog.Definition definition = AccountPreferenceCatalog.definitionFor(actor.getRole(), item.eventKey());
                if (definition == null) {
                    continue;
                }
                UserNotificationPreference preference = byKey.get(definition.key());
                if (item.inAppEnabled() != null) {
                    preference.setInAppEnabled(item.inAppEnabled());
                }
                if (item.emailEnabled() != null) {
                    preference.setEmailEnabled(item.emailEnabled());
                }
                if (StringUtils.hasText(item.deliveryMode())) {
                    preference.setDeliveryMode(normalizeOption(item.deliveryMode(), ALLOWED_DELIVERY_MODES, definition.defaultDeliveryMode()));
                }
            }
        }

        userNotificationPreferenceRepository.saveAll(preferences);
        return toNotificationResponses(actor, preferences);
    }

    @Transactional(readOnly = true)
    public List<UserSessionResponse> listSessions(User actor, String currentRefreshToken) {
        return List.of();
    }

    @Transactional
    public void revokeSession(User actor, Long sessionId) {
        throw new BadRequestException("Session management is not available in the current backend configuration.");
    }

    @Transactional
    public void revokeOtherSessions(User actor, String currentRefreshToken) {
        authRefreshTokenService.revokeAllForUser(actor.getId());
    }

    @Transactional
    public UserProfileResponse updateAvatar(
            User actor,
            MultipartFile file,
            String avatarType,
            String avatarPreset,
            String currentRefreshToken) {
        throw new BadRequestException("Avatar uploads are not available in the current backend configuration.");
    }

    @Transactional
    public UserProfileResponse deleteAvatar(User actor, String currentRefreshToken) {
        throw new BadRequestException("Avatar uploads are not available in the current backend configuration.");
    }

    @Transactional(readOnly = true)
    public Object downloadMyAvatar(User actor) {
        throw new BadRequestException("Avatar downloads are not available in the current backend configuration.");
    }

    @Transactional
    public UserWithTicketCountResponse updateManagedAccount(User actor, Long userId, UserAdminAccountUpdateRequest request) {
        requireAdmin(actor);
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        User saved = userRepository.save(target);
        return UserMapper.toWithTicketCount(saved, resolveTicketCount(saved));
    }

    private UserProfileResponse toAccountResponse(User actor, String currentRefreshToken) {
        return new UserProfileResponse(
                actor.getId(),
                actor.getUsername(),
                actor.getEmail(),
                actor.getFullName(),
                actor.getRole().name(),
                actor.getCreatedAt());
    }

    private List<UserNotificationPreferenceResponse> toNotificationResponses(
            User actor,
            List<UserNotificationPreference> notifications) {
        Map<String, UserNotificationPreference> byKey = new LinkedHashMap<>();
        notifications.forEach(item -> byKey.put(item.getEventKey(), item));
        List<UserNotificationPreferenceResponse> responses = new ArrayList<>();
        for (AccountPreferenceCatalog.Definition definition : AccountPreferenceCatalog.definitionsFor(actor.getRole())) {
            UserNotificationPreference item = byKey.get(definition.key());
            if (item == null) {
                continue;
            }
            responses.add(new UserNotificationPreferenceResponse(
                    item.getEventKey(),
                    definition.label(),
                    item.isInAppEnabled(),
                    item.isEmailEnabled(),
                    item.getDeliveryMode()));
        }
        return responses;
    }

    private List<UserNotificationPreference> ensureNotificationPreferences(User actor) {
        List<UserNotificationPreference> existing = userNotificationPreferenceRepository.findByUser_IdOrderByEventKeyAsc(actor.getId());
        Map<String, UserNotificationPreference> byKey = new HashMap<>();
        existing.forEach(item -> byKey.put(item.getEventKey(), item));
        List<UserNotificationPreference> created = new ArrayList<>();

        for (AccountPreferenceCatalog.Definition definition : AccountPreferenceCatalog.definitionsFor(actor.getRole())) {
            if (byKey.containsKey(definition.key())) {
                continue;
            }
            UserNotificationPreference preference = new UserNotificationPreference();
            preference.setUser(actor);
            preference.setEventKey(definition.key());
            preference.setInAppEnabled(definition.defaultInAppEnabled());
            preference.setEmailEnabled(definition.defaultEmailEnabled());
            preference.setDeliveryMode(definition.defaultDeliveryMode());
            created.add(preference);
        }

        if (!created.isEmpty()) {
            userNotificationPreferenceRepository.saveAll(created);
            existing = userNotificationPreferenceRepository.findByUser_IdOrderByEventKeyAsc(actor.getId());
        }
        return existing;
    }

    private UserPreference getOrCreatePreferences(User actor) {
        return userPreferenceRepository.findByUser_Id(actor.getId())
                .orElseGet(() -> userPreferenceRepository.save(defaultPreferences(actor)));
    }

    private UserPreference defaultPreferences(User actor) {
        UserPreference preferences = new UserPreference();
        preferences.setUser(actor);
        preferences.setTheme(DEFAULT_THEME);
        preferences.setDensity(DEFAULT_DENSITY);
        preferences.setTimezone(DEFAULT_TIMEZONE);
        preferences.setLanguage(DEFAULT_LANGUAGE);
        preferences.setReduceMotion(false);
        preferences.setSidebarCollapsedDefault(false);
        preferences.setRowsPerPage(10);
        preferences.setStickyFilters(true);
        preferences.setRememberLastSearch(true);
        preferences.setStudentShowResolvedFirst(false);
        preferences.setMaintenanceDefaultQueueSort("urgency");
        preferences.setMaintenanceShowOnlyActiveOnOpen(true);
        preferences.setMaintenanceHighlightSlaBreaches(true);
        preferences.setAdminDefaultAnalyticsRange("Weekly");
        preferences.setAdminDefaultTicketScope("all");
        preferences.setAdminShowCriticalFirst(true);
        preferences.setQuietHoursEnabled(false);
        preferences.setQuietHoursStart(null);
        preferences.setQuietHoursEnd(null);
        return preferences;
    }

    private UserPreferencesResponse toPreferencesResponse(UserPreference preferences) {
        return new UserPreferencesResponse(
                preferences.getTheme(),
                preferences.getDensity(),
                preferences.getTimezone(),
                preferences.getLanguage(),
                preferences.isReduceMotion(),
                preferences.isSidebarCollapsedDefault(),
                preferences.getDefaultLandingSection(),
                preferences.getRowsPerPage(),
                preferences.isStickyFilters(),
                preferences.isRememberLastSearch(),
                preferences.isStudentShowResolvedFirst(),
                preferences.getMaintenanceDefaultQueueSort(),
                preferences.isMaintenanceShowOnlyActiveOnOpen(),
                preferences.isMaintenanceHighlightSlaBreaches(),
                preferences.getAdminDefaultAnalyticsRange(),
                preferences.getAdminDefaultTicketScope(),
                preferences.isAdminShowCriticalFirst(),
                preferences.isQuietHoursEnabled(),
                preferences.getQuietHoursStart(),
                preferences.getQuietHoursEnd());
    }

    private long resolveTicketCount(User user) {
        return switch (user.getRole()) {
            case STUDENT -> ticketRepository.countByCreatedById(user.getId());
            case MAINTENANCE -> ticketRepository.countByAssignedToId(user.getId());
            default -> 0;
        };
    }

    private void requireAdmin(User actor) {
        if (actor == null || actor.getRole() == null || actor.getRole().name().equals("ADMIN") == false) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }

    private String normalizeOption(String value, List<String> allowedValues, String fallback) {
        if (!StringUtils.hasText(value)) {
            return fallback;
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return allowedValues.contains(normalized) ? normalized : fallback;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String hashRefreshToken(String currentRefreshToken) {
        if (!StringUtils.hasText(currentRefreshToken)) {
            return null;
        }
        return tokenHashService.hashSha256(currentRefreshToken.trim());
    }

    private String resolveDeviceLabel(String userAgent) {
        if (!StringUtils.hasText(userAgent)) {
            return "Unknown device";
        }
        String normalized = userAgent.toLowerCase(Locale.ROOT);
        if (normalized.contains("windows")) {
            return "Windows browser";
        }
        if (normalized.contains("android")) {
            return "Android device";
        }
        if (normalized.contains("iphone") || normalized.contains("ipad") || normalized.contains("ios")) {
            return "Apple mobile device";
        }
        if (normalized.contains("mac os") || normalized.contains("macintosh")) {
            return "Mac browser";
        }
        if (normalized.contains("linux")) {
            return "Linux browser";
        }
        return "Web session";
    }
}
