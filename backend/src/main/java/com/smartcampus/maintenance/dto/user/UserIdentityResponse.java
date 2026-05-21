package com.smartcampus.maintenance.dto.user;

import java.time.LocalDateTime;

public record UserIdentityResponse(
        Long id,
        String username,
        String email,
        String fullName,
        String role,
        boolean emailVerified,
        LocalDateTime createdAt,
        UserAvatarResponse avatar) {
}
