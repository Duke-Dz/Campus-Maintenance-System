package com.smartcampus.maintenance.dto.user;

public record UserProfileDetailsResponse(
        String departmentName,
        String phoneExtension,
        BuildingReferenceResponse primaryBuilding) {
}
