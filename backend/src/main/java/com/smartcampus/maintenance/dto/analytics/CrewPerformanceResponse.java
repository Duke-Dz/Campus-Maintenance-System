package com.smartcampus.maintenance.dto.analytics;

public record CrewPerformanceResponse(
    Long userId,
    String username,
    String fullName,
    long resolvedTickets
) {
}
