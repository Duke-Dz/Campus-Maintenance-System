package com.smartcampus.maintenance.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token is required") String token,

        @NotBlank(message = "New password is required") @Size(min = 8, max = 120, message = "Password must be 8-120 characters") String newPassword) {
}
