package com.smartcampus.maintenance.dto.ticket;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketAssignRequest(
    @NotNull(message = "Assignee id is required")
    Long assigneeId,

    @Size(max = 500, message = "Note must be at most 500 characters")
    String note
) {
}
