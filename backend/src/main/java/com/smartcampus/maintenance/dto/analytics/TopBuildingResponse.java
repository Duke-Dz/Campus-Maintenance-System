package com.smartcampus.maintenance.dto.analytics;

public record TopBuildingResponse(
    String building,
    long totalIssues
) {
}
