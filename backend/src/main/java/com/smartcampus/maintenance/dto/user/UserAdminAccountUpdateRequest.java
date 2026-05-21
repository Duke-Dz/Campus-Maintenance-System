package com.smartcampus.maintenance.dto.user;

public record UserAdminAccountUpdateRequest(
        String departmentName,
        String phoneExtension,
        Long primaryBuildingId) {
}
