package com.smartcampus.maintenance.dto.user;

public record UserNotificationPreferenceUpdateItemRequest(
        String eventKey,
        Boolean inAppEnabled,
        Boolean emailEnabled,
        String deliveryMode) {
}
