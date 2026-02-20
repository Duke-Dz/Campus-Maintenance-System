package com.smartcampus.maintenance.dto.ticket;

import java.util.List;

public record DuplicateCheckResponse(
        boolean hasSimilar,
        List<SimilarTicketSummary> similarTickets,
        String message) {
    public record SimilarTicketSummary(
            Long id,
            String title,
            String status,
            String building,
            String category) {
    }
}
