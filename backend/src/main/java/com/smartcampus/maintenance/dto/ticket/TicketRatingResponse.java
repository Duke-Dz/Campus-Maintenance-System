package com.smartcampus.maintenance.dto.ticket;

import java.time.LocalDateTime;

public record TicketRatingResponse(
    Integer stars,
    String comment,
    TicketUserInfoResponse ratedBy,
    LocalDateTime createdAt
) {
}
