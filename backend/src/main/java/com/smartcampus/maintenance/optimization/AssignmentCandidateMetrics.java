package com.smartcampus.maintenance.optimization;

import java.util.List;

public record AssignmentCandidateMetrics(
        Long userId,
        String username,
        String fullName,
        int activeOpenTickets,
        int sameDomainResolvedTickets,
        int sameBuildingResolvedTickets,
        int recentResolvedTickets,
        boolean specializationMatch,
        List<String> specialties) {
}
