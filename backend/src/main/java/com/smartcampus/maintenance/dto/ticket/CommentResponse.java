package com.smartcampus.maintenance.dto.ticket;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long ticketId,
        String authorUsername,
        String authorFullName,
        String authorRole,
        String content,
        LocalDateTime createdAt) {
}
