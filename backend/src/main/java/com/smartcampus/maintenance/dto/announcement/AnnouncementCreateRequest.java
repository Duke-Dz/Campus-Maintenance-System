package com.smartcampus.maintenance.dto.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnnouncementCreateRequest(
        @NotBlank(message = "Title is required") @Size(max = 200, message = "Title must be at most 200 characters") String title,

        @NotBlank(message = "Content is required") @Size(max = 5000, message = "Content must be at most 5000 characters") String content) {
}
