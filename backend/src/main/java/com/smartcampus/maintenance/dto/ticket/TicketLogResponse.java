package com.smartcampus.maintenance.dto.ticket;

import java.time.LocalDateTime;

public record TicketLogResponse(
    Long id,
    String oldStatus,
    String newStatus,
    String note,
    TicketUserInfoResponse changedBy,
    LocalDateTime timestamp
) {
}
