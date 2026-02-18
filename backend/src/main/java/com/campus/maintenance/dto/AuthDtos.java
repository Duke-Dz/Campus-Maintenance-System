package com.campus.maintenance.dto;

import com.campus.maintenance.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record RegisterRequest(
            @NotBlank String name,
            @NotBlank String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String password,
            User.Role role
    ) {}

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record AuthResponse(String token, String role, String username, String email) {}

    public record ForgotPasswordRequest(@NotBlank @Email String email) {}

    public record ResetPasswordRequest(
            @NotBlank @Email String email,
            @NotBlank @Pattern(regexp = "^[0-9]{6}$") String code,
            @NotBlank @Size(min = 8) String newPassword
    ) {}

    public record SocialLinkResponse(String platform, String url, long clickCount) {}

    public record ApiMessage(String message) {}
}
