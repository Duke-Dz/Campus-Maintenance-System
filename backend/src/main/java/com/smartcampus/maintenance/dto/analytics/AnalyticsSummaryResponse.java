package com.smartcampus.maintenance.dto.analytics;

import java.util.Map;

public record AnalyticsSummaryResponse(
    long totalTickets,
    Map<String, Long> byStatus,
    Map<String, Long> byCategory,
    Map<String, Long> byUrgency
) {
}
