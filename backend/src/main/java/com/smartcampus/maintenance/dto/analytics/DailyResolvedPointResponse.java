package com.smartcampus.maintenance.dto.analytics;

public record DailyResolvedPointResponse(
    String date,
    long resolvedTickets
) {
}
