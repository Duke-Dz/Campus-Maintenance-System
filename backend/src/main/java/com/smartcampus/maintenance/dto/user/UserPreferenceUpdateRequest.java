package com.smartcampus.maintenance.dto.user;

import java.time.LocalTime;

public record UserPreferenceUpdateRequest(
        String theme,
        String density,
        String timezone,
        String language,
        Boolean reduceMotion,
        Boolean sidebarCollapsedDefault,
        String defaultLandingSection,
        Integer rowsPerPage,
        Boolean stickyFilters,
        Boolean rememberLastSearch,
        Boolean studentShowResolvedFirst,
        String maintenanceDefaultQueueSort,
        Boolean maintenanceShowOnlyActiveOnOpen,
        Boolean maintenanceHighlightSlaBreaches,
        String adminDefaultAnalyticsRange,
        String adminDefaultTicketScope,
        Boolean adminShowCriticalFirst,
        Boolean quietHoursEnabled,
        LocalTime quietHoursStart,
        LocalTime quietHoursEnd) {
}
