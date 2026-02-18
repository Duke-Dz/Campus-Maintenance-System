package com.smartcampus.maintenance.dto.ticket;

import com.smartcampus.maintenance.entity.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketStatusUpdateRequest(
    @NotNull(message = "Status is required")
    TicketStatus status,

    @Size(max = 500, message = "Note must be at most 500 characters")
    String note,

    Boolean override
) {
}
