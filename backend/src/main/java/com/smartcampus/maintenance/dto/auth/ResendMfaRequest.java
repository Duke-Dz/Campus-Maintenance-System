package com.smartcampus.maintenance.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResendMfaRequest(
        @NotBlank(message = "Challenge ID is required")
        @Size(max = 64, message = "Challenge ID is too long")
        String challengeId) {
}
