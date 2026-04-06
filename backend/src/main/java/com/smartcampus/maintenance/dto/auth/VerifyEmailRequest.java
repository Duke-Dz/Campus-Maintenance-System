package com.smartcampus.maintenance.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email is invalid")
        String email,

        @NotBlank(message = "Verification code is required")
        @Size(min = 4, max = 12, message = "Verification code must be 4-12 characters")
        String code) {
}
