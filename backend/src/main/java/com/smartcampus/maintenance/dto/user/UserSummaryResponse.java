package com.smartcampus.maintenance.dto.user;

import java.time.LocalDateTime;
import java.util.List;

public record UserSummaryResponse(
    Long id,
    String username,
    String email,
    String fullName,
    String role,
    LocalDateTime createdAt,
    List<String> specialties
) {
}
