package com.smartcampus.maintenance.dto.analytics;

public record PublicLandingConfigResponse(
    String supportHours,
    String supportPhone,
    String supportTimezone,
    int urgentSlaHours,
    int standardSlaHours
) {
}
