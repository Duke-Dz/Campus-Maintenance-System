package com.smartcampus.maintenance.dto.user;

import java.time.LocalTime;

public record UserPreferencesResponse(
        String theme,
        String density,
        String timezone,
        String language,
        boolean reduceMotion,
        boolean sidebarCollapsedDefault,
        String defaultLandingSection,
        int rowsPerPage,
        boolean stickyFilters,
        boolean rememberLastSearch,
        boolean studentShowResolvedFirst,
        String maintenanceDefaultQueueSort,
        boolean maintenanceShowOnlyActiveOnOpen,
        boolean maintenanceHighlightSlaBreaches,
        String adminDefaultAnalyticsRange,
        String adminDefaultTicketScope,
        boolean adminShowCriticalFirst,
        boolean quietHoursEnabled,
        LocalTime quietHoursStart,
        LocalTime quietHoursEnd) {
}
