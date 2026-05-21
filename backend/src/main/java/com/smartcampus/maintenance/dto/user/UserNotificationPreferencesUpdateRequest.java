package com.smartcampus.maintenance.dto.user;

import java.util.List;

public record UserNotificationPreferencesUpdateRequest(
        List<UserNotificationPreferenceUpdateItemRequest> items) {
}
