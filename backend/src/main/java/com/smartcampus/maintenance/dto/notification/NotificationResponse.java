package com.smartcampus.maintenance.dto.notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String type,
        boolean read,
        String linkUrl,
        LocalDateTime createdAt) {
}
