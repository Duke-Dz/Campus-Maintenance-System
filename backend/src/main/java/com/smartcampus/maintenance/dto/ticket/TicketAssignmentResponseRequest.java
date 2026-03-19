package com.smartcampus.maintenance.dto.ticket;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketAssignmentResponseRequest(
        @NotNull(message = "Accepted flag is required")
        Boolean accepted,

        @Size(max = 500, message = "Note must be at most 500 characters")
        String note) {
}
