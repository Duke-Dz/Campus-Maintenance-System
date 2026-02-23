package com.smartcampus.maintenance.dto.user;

import java.time.LocalDateTime;

public record BroadcastMessageResponse(
        String title,
        String audience,
        int recipientCount,
        LocalDateTime createdAt) {
}
