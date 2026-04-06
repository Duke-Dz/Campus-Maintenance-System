package com.smartcampus.maintenance.dto.auth;

public record AuthResponse(
    String accessToken,
    String expiresAt,
    String username,
    String fullName,
    String role,
    Boolean mfaRequired,
    String mfaChallengeId,
    String message
) {
}
