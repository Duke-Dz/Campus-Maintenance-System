package com.smartcampus.maintenance.dto.ticket;

import java.util.List;

public record TicketAssignmentRecommendationResponse(
        Long userId,
        String username,
        String fullName,
        double score,
        boolean specializationMatch,
        List<String> specialties,
        List<String> reasons) {
}
