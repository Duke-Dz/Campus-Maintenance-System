package com.smartcampus.maintenance.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentCreateRequest(
        @NotBlank(message = "Comment content is required") @Size(max = 2000, message = "Comment must be at most 2000 characters") String content) {
}
