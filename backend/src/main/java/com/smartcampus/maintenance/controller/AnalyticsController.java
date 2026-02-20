package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.analytics.AnalyticsSummaryResponse;
import com.smartcampus.maintenance.dto.analytics.CrewPerformanceResponse;
import com.smartcampus.maintenance.dto.analytics.PublicLandingConfigResponse;
import com.smartcampus.maintenance.dto.analytics.PublicLandingStatsResponse;
import com.smartcampus.maintenance.dto.analytics.ResolutionTimeResponse;
import com.smartcampus.maintenance.dto.analytics.SlaComplianceResponse;
import com.smartcampus.maintenance.dto.analytics.TopBuildingResponse;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.service.AnalyticsService;
import com.smartcampus.maintenance.service.CurrentUserService;
import com.smartcampus.maintenance.service.PublicLandingConfigService;
import com.smartcampus.maintenance.service.ReportService;
import com.smartcampus.maintenance.service.SlaService;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final PublicLandingConfigService publicLandingConfigService;
    private final SlaService slaService;
    private final ReportService reportService;
    private final CurrentUserService currentUserService;

    public AnalyticsController(AnalyticsService analyticsService, PublicLandingConfigService publicLandingConfigService, SlaService slaService,
            ReportService reportService, CurrentUserService currentUserService) {
        this.analyticsService = analyticsService;
        this.publicLandingConfigService = publicLandingConfigService;
        this.slaService = slaService;
        this.reportService = reportService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/summary")
    public AnalyticsSummaryResponse getSummary() {
        User actor = currentUserService.requireCurrentUser();
        return analyticsService.getSummary(actor);
    }

    @GetMapping("/public-summary")
    public PublicLandingStatsResponse getPublicSummary() {
        return analyticsService.getPublicLandingStats();
    }

    @GetMapping("/public-config")
    public PublicLandingConfigResponse getPublicConfig() {
        return publicLandingConfigService.getPublicConfig();
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

    @GetMapping("/sla-compliance")
    public SlaComplianceResponse getSlaCompliance() {
        User actor = currentUserService.requireCurrentUser();
        return slaService.getSlaCompliance(actor);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        User actor = currentUserService.requireCurrentUser();
        byte[] csv = reportService.exportTicketsCsv(actor);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tickets-report.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv);
    }
}
