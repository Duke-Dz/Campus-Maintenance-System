package com.smartcampus.maintenance.dto.user;

public record UserNotificationPreferenceResponse(
        String eventKey,
        String label,
        boolean inAppEnabled,
        boolean emailEnabled,
        String deliveryMode) {
}
