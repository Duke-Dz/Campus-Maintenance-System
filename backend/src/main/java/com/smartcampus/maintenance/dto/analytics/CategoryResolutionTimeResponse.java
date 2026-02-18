package com.smartcampus.maintenance.dto.analytics;

public record CategoryResolutionTimeResponse(
    String category,
    double averageHours,
    long resolvedTickets
) {
}
