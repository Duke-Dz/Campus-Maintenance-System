package com.smartcampus.maintenance.repository.projection;

public record AssignmentCandidateMetrics(
        Long userId,
        String username,
        String fullName,
        long activeOpenTickets,
        long sameDomainResolvedTickets,
        long sameBuildingResolvedTickets,
        long recentResolvedTickets) {
}
