package com.smartcampus.maintenance.dto.analytics;

import java.util.List;

public record ResolutionTimeResponse(
    double overallAverageHours,
    List<CategoryResolutionTimeResponse> byCategory
) {
}
