package com.smartcampus.maintenance.dto.ticket;

import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        String title,
        String description,
        String category,
        String building,
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
