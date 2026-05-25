package com.smartcampus.maintenance.dto.ticket;

import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        String title,
        String description,
        String category,
        String serviceDomainKey,
        boolean assignmentReviewRequired,
        String assignmentReviewReason,
        TicketRequestTypeResponse requestType,
        TicketBuildingResponse building,
        String location,
        String urgency,
        String status,
        TicketUserInfoResponse createdBy,
        TicketUserInfoResponse assignedTo,
        String imageUrl,
        String afterImageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt) {
}
