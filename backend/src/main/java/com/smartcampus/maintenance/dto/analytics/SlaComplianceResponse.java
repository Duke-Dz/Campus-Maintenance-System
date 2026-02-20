package com.smartcampus.maintenance.dto.analytics;

public record SlaComplianceResponse(
        long totalTickets,
        long onTimeTickets,
        long breachedTickets,
        double compliancePercentage,
        double avgResolutionHours,
        long criticalSlaHours,
        long highSlaHours,
        long mediumSlaHours,
        long lowSlaHours) {
}
