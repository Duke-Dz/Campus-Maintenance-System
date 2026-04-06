package com.smartcampus.maintenance.optimization;

public record AssignmentCandidateMetrics(
        Long userId,
        String username,
        String fullName,
        int activeOpenTickets,
        int sameDomainResolvedTickets,
        int sameBuildingResolvedTickets,
        int recentResolvedTickets) {
}
