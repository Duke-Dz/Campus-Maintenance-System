package com.smartcampus.maintenance.dto.user;

import java.time.LocalDateTime;

public record UserSecuritySummaryResponse(
        LocalDateTime lastLoginAt,
        int activeSessionCount,
        Long currentSessionId) {
}
