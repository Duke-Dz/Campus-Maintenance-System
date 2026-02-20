package com.smartcampus.maintenance.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatSendRequest(
        @NotBlank(message = "Message content is required") @Size(max = 2000, message = "Message must be at most 2000 characters") String content) {
}
