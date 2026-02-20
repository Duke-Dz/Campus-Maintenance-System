package com.smartcampus.maintenance.dto.announcement;

import java.time.LocalDateTime;

public record AnnouncementResponse(
        Long id,
        String title,
        String content,
        boolean active,
        String createdByUsername,
        String createdByFullName,
        LocalDateTime createdAt) {
}
