package com.smartcampus.maintenance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 20)
    private String theme = "light";

    @Column(nullable = false, length = 20)
    private String density = "comfortable";

    @Column(nullable = false, length = 64)
    private String timezone = "Africa/Nairobi";

    @Column(nullable = false, length = 16)
    private String language = "en";

    @Column(name = "reduce_motion", nullable = false)
    private boolean reduceMotion = false;

    @Column(name = "sidebar_collapsed_default", nullable = false)
    private boolean sidebarCollapsedDefault = false;

    @Column(name = "default_landing_section", length = 80)
    private String defaultLandingSection;

    @Column(name = "rows_per_page", nullable = false)
    private int rowsPerPage = 10;

    @Column(name = "sticky_filters", nullable = false)
    private boolean stickyFilters = true;

    @Column(name = "remember_last_search", nullable = false)
    private boolean rememberLastSearch = true;

    @Column(name = "student_show_resolved_first", nullable = false)
    private boolean studentShowResolvedFirst = false;

    @Column(name = "maintenance_default_queue_sort", length = 32)
    private String maintenanceDefaultQueueSort = "urgency";

    @Column(name = "maintenance_show_only_active_on_open", nullable = false)
    private boolean maintenanceShowOnlyActiveOnOpen = true;

    @Column(name = "maintenance_highlight_sla_breaches", nullable = false)
    private boolean maintenanceHighlightSlaBreaches = true;

    @Column(name = "admin_default_analytics_range", length = 32)
    private String adminDefaultAnalyticsRange = "Weekly";

    @Column(name = "admin_default_ticket_scope", length = 32)
    private String adminDefaultTicketScope = "all";

    @Column(name = "admin_show_critical_first", nullable = false)
    private boolean adminShowCriticalFirst = true;

    @Column(name = "quiet_hours_enabled", nullable = false)
    private boolean quietHoursEnabled = false;

    @Column(name = "quiet_hours_start")
    private LocalTime quietHoursStart;

    @Column(name = "quiet_hours_end")
    private LocalTime quietHoursEnd;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getDensity() {
        return density;
    }

    public void setDensity(String density) {
        this.density = density;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public boolean isReduceMotion() {
        return reduceMotion;
    }

    public void setReduceMotion(boolean reduceMotion) {
        this.reduceMotion = reduceMotion;
    }

    public boolean isSidebarCollapsedDefault() {
        return sidebarCollapsedDefault;
    }

    public void setSidebarCollapsedDefault(boolean sidebarCollapsedDefault) {
        this.sidebarCollapsedDefault = sidebarCollapsedDefault;
    }

    public String getDefaultLandingSection() {
        return defaultLandingSection;
    }

    public void setDefaultLandingSection(String defaultLandingSection) {
        this.defaultLandingSection = defaultLandingSection;
    }

    public int getRowsPerPage() {
        return rowsPerPage;
    }

    public void setRowsPerPage(int rowsPerPage) {
        this.rowsPerPage = rowsPerPage;
    }

    public boolean isStickyFilters() {
        return stickyFilters;
    }

    public void setStickyFilters(boolean stickyFilters) {
        this.stickyFilters = stickyFilters;
    }

    public boolean isRememberLastSearch() {
        return rememberLastSearch;
    }

    public void setRememberLastSearch(boolean rememberLastSearch) {
        this.rememberLastSearch = rememberLastSearch;
    }

    public boolean isStudentShowResolvedFirst() {
        return studentShowResolvedFirst;
    }

    public void setStudentShowResolvedFirst(boolean studentShowResolvedFirst) {
        this.studentShowResolvedFirst = studentShowResolvedFirst;
    }

    public String getMaintenanceDefaultQueueSort() {
        return maintenanceDefaultQueueSort;
    }

    public void setMaintenanceDefaultQueueSort(String maintenanceDefaultQueueSort) {
        this.maintenanceDefaultQueueSort = maintenanceDefaultQueueSort;
    }

    public boolean isMaintenanceShowOnlyActiveOnOpen() {
        return maintenanceShowOnlyActiveOnOpen;
    }

    public void setMaintenanceShowOnlyActiveOnOpen(boolean maintenanceShowOnlyActiveOnOpen) {
        this.maintenanceShowOnlyActiveOnOpen = maintenanceShowOnlyActiveOnOpen;
    }

    public boolean isMaintenanceHighlightSlaBreaches() {
        return maintenanceHighlightSlaBreaches;
    }

    public void setMaintenanceHighlightSlaBreaches(boolean maintenanceHighlightSlaBreaches) {
        this.maintenanceHighlightSlaBreaches = maintenanceHighlightSlaBreaches;
    }

    public String getAdminDefaultAnalyticsRange() {
        return adminDefaultAnalyticsRange;
    }

    public void setAdminDefaultAnalyticsRange(String adminDefaultAnalyticsRange) {
        this.adminDefaultAnalyticsRange = adminDefaultAnalyticsRange;
    }

    public String getAdminDefaultTicketScope() {
        return adminDefaultTicketScope;
    }

    public void setAdminDefaultTicketScope(String adminDefaultTicketScope) {
        this.adminDefaultTicketScope = adminDefaultTicketScope;
    }

    public boolean isAdminShowCriticalFirst() {
        return adminShowCriticalFirst;
    }

    public void setAdminShowCriticalFirst(boolean adminShowCriticalFirst) {
        this.adminShowCriticalFirst = adminShowCriticalFirst;
    }

    public boolean isQuietHoursEnabled() {
        return quietHoursEnabled;
    }

    public void setQuietHoursEnabled(boolean quietHoursEnabled) {
        this.quietHoursEnabled = quietHoursEnabled;
    }

    public LocalTime getQuietHoursStart() {
        return quietHoursStart;
    }

    public void setQuietHoursStart(LocalTime quietHoursStart) {
        this.quietHoursStart = quietHoursStart;
    }

    public LocalTime getQuietHoursEnd() {
        return quietHoursEnd;
    }

    public void setQuietHoursEnd(LocalTime quietHoursEnd) {
        this.quietHoursEnd = quietHoursEnd;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
