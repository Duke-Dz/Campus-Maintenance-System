package com.smartcampus.maintenance.dto.auth;

public record AuthResponse(
    String token,
    String username,
    String fullName,
    String role
) {
}
