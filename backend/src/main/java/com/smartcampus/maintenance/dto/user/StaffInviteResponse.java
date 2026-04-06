package com.smartcampus.maintenance.dto.user;

import java.time.LocalDateTime;

public record StaffInviteResponse(
        Long id,
        String email,
        String fullName,
        LocalDateTime expiresAt) {
}
