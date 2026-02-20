package com.smartcampus.maintenance.dto.chat;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        Long ticketId,
        String senderUsername,
        String senderFullName,
        String senderRole,
        String content,
        LocalDateTime createdAt) {
}
