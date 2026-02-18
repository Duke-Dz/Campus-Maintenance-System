package com.smartcampus.maintenance.dto.user;

import java.time.LocalDateTime;

public record UserSummaryResponse(
    Long id,
    String username,
    String email,
    String fullName,
    String role,
    LocalDateTime createdAt
) {
}
