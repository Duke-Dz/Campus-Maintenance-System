package com.smartcampus.maintenance.dto.analytics;

import java.time.LocalDateTime;
import java.util.List;

public record PublicLandingStatsResponse(
    long totalTickets,
    long resolvedTickets,
    long openTickets,
    long resolvedToday,
    double averageResolutionHours,
    List<DailyResolvedPointResponse> resolvedLast7Days,
    LocalDateTime lastUpdatedAt
) {
}
