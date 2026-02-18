package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.analytics.AnalyticsSummaryResponse;
import com.smartcampus.maintenance.dto.analytics.CrewPerformanceResponse;
import com.smartcampus.maintenance.dto.analytics.ResolutionTimeResponse;
import com.smartcampus.maintenance.dto.analytics.TopBuildingResponse;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.service.AnalyticsService;
import com.smartcampus.maintenance.service.CurrentUserService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final CurrentUserService currentUserService;

    public AnalyticsController(AnalyticsService analyticsService, CurrentUserService currentUserService) {
        this.analyticsService = analyticsService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/summary")
    public AnalyticsSummaryResponse getSummary() {
        User actor = currentUserService.requireCurrentUser();
        return analyticsService.getSummary(actor);
    }

    @GetMapping("/resolution-time")
    public ResolutionTimeResponse getResolutionTime() {
        User actor = currentUserService.requireCurrentUser();
        return analyticsService.getResolutionTime(actor);
    }

    @GetMapping("/top-buildings")
    public List<TopBuildingResponse> getTopBuildings() {
        User actor = currentUserService.requireCurrentUser();
        return analyticsService.getTopBuildings(actor);
    }

    @GetMapping("/crew-performance")
    public List<CrewPerformanceResponse> getCrewPerformance() {
        User actor = currentUserService.requireCurrentUser();
        return analyticsService.getCrewPerformance(actor);
    }
}
