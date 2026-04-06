package com.smartcampus.maintenance.optimization;

public final class AssignmentScorer {

    private static final double WORKLOAD_WEIGHT = 55.0;
    private static final double SERVICE_DOMAIN_WEIGHT = 12.0;
    private static final double BUILDING_WEIGHT = 7.5;
    private static final double RECENT_RESOLUTION_WEIGHT = 10.0;

    private AssignmentScorer() {
    }

    public static double scoreCandidate(AssignmentCandidateMetrics candidate) {
        double workloadScore = WORKLOAD_WEIGHT / (1.0 + candidate.activeOpenTickets());
        double serviceDomainScore = SERVICE_DOMAIN_WEIGHT * Math.log1p(candidate.sameDomainResolvedTickets());
        double buildingScore = BUILDING_WEIGHT * Math.log1p(candidate.sameBuildingResolvedTickets());
        double recentResolutionScore = RECENT_RESOLUTION_WEIGHT * Math.log1p(candidate.recentResolvedTickets());
        return workloadScore + serviceDomainScore + buildingScore + recentResolutionScore;
    }
}
