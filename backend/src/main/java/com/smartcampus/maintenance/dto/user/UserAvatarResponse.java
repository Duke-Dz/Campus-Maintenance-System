package com.smartcampus.maintenance.dto.user;

public record UserAvatarResponse(
        String avatarType,
        String avatarPreset,
        String avatarImageUrl,
        boolean uploaded) {
}
