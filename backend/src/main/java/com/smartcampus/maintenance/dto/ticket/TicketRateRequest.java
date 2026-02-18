package com.smartcampus.maintenance.dto.ticket;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketRateRequest(
    @NotNull(message = "Stars are required")
    @Min(value = 1, message = "Stars must be at least 1")
    @Max(value = 5, message = "Stars must be at most 5")
    Integer stars,

    @Size(max = 500, message = "Comment must be at most 500 characters")
    String comment
) {
}
