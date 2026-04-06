package com.smartcampus.maintenance.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyMfaRequest(
        @NotBlank(message = "Challenge ID is required")
        @Size(max = 64, message = "Challenge ID is too long")
        String challengeId,

        @NotBlank(message = "Code is required")
        @Size(min = 4, max = 12, message = "Code must be 4-12 characters")
        String code) {
}
