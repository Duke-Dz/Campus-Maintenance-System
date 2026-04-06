package com.smartcampus.maintenance.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcceptStaffInviteRequest(
        @NotBlank(message = "Token is required") String token,

        @NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be 3-50 characters") String username,

        @NotBlank(message = "Password is required") @Size(min = 10, max = 120, message = "Password must be 10-120 characters") String password) {
}
