package com.smartcampus.maintenance.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateStaffRequest(
        @NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be 3-50 characters") String username,

        @NotBlank(message = "Email is required") @Email(message = "Email is invalid") String email,

        @NotBlank(message = "Full name is required") @Size(max = 120, message = "Full name must be at most 120 characters") String fullName,

        @NotBlank(message = "Password is required") @Size(min = 8, max = 120, message = "Password must be 8-120 characters") String password) {
}
