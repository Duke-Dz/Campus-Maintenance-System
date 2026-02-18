package com.smartcampus.maintenance.dto.ticket;

import com.smartcampus.maintenance.entity.enums.TicketCategory;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketCreateRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must be at most 150 characters")
    String title,

    @NotBlank(message = "Description is required")
    @Size(max = 4000, message = "Description must be at most 4000 characters")
    String description,

    @NotNull(message = "Category is required")
    TicketCategory category,

    @NotBlank(message = "Building is required")
    @Size(max = 120, message = "Building must be at most 120 characters")
    String building,

    @NotBlank(message = "Location is required")
    @Size(max = 120, message = "Location must be at most 120 characters")
    String location,

    @NotNull(message = "Urgency is required")
    UrgencyLevel urgency
) {
}
