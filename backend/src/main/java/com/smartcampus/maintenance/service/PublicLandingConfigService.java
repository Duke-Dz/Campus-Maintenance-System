package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.analytics.PublicLandingConfigResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PublicLandingConfigService {

    @Value("${app.landing.support-hours:Mon-Fri, 08:00-20:00}")
    private String supportHours;

    @Value("${app.landing.support-phone:+254 747988030}")
    private String supportPhone;

    @Value("${app.landing.support-timezone:Local campus time}")
    private String supportTimezone;

    @Value("${app.landing.sla.urgent-hours:2}")
    private int urgentSlaHours;

    @Value("${app.landing.sla.standard-hours:24}")
    private int standardSlaHours;

    public PublicLandingConfigResponse getPublicConfig() {
        return new PublicLandingConfigResponse(
            supportHours,
            supportPhone,
            supportTimezone,
            urgentSlaHours,
            standardSlaHours
        );
    }
}
