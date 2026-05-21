package com.smartcampus.maintenance.dto.user;

import java.time.LocalDateTime;

public record UserSessionResponse(
        Long id,
        String deviceLabel,
        String userAgent,
        String ipAddress,
        LocalDateTime createdAt,
        LocalDateTime lastUsedAt,
        LocalDateTime expiresAt,
        boolean current) {
}
