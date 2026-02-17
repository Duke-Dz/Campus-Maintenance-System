package com.campus.maintenance.controller;

import com.campus.maintenance.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public Map<String, Long> dashboardStats() {
        return analyticsService.getDashboardStats();
    }
}
