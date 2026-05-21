package com.smartcampus.maintenance.config;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Profile("prod")
public class ProductionDeploymentValidator implements ApplicationRunner {

    static final String DEFAULT_JWT_SECRET = "replace-this-with-a-very-long-32-char-secret-value";

    private final String jwtSecret;
    private final boolean h2ConsoleEnabled;
    private final boolean bootstrapAdmin;
    private final boolean seedDemoData;
    private final boolean syncExistingAdmin;
    private final String adminPassword;
    private final String datasourceUrl;
    private final String frontendBaseUrl;
    private final List<String> corsAllowedOrigins;
    private final boolean emailEnabled;
    private final String mailHost;
    private final String mailUsername;
    private final String mailPassword;
    private final boolean captchaEnabled;
    private final String captchaSecretKey;
    private final boolean rateLimitRedisEnabled;
    private final boolean refreshCookieSecure;
    private final boolean allowLocalhostInProd;

    public ProductionDeploymentValidator(
        @Value("${jwt.secret}") String jwtSecret,
        @Value("${spring.h2.console.enabled:false}") boolean h2ConsoleEnabled,
        @Value("${app.seed.bootstrap-admin:false}") boolean bootstrapAdmin,
        @Value("${app.seed.demo-data:false}") boolean seedDemoData,
        @Value("${app.seed.admin.sync-existing:false}") boolean syncExistingAdmin,
        @Value("${app.seed.admin.password:}") String adminPassword,
        @Value("${spring.datasource.url:}") String datasourceUrl,
        @Value("${app.frontend.base-url:}") String frontendBaseUrl,
        @Value("${app.cors.allowed-origins:}") List<String> corsAllowedOrigins,
        @Value("${app.email.enabled:false}") boolean emailEnabled,
        @Value("${spring.mail.host:}") String mailHost,
        @Value("${spring.mail.username:}") String mailUsername,
        @Value("${spring.mail.password:}") String mailPassword,
        @Value("${app.security.captcha.enabled:false}") boolean captchaEnabled,
        @Value("${app.security.captcha.turnstile.secret-key:}") String captchaSecretKey,
        @Value("${app.security.rate-limit.redis-enabled:false}") boolean rateLimitRedisEnabled,
        @Value("${app.auth.refresh-cookie-secure:false}") boolean refreshCookieSecure,
        @Value("${app.prod.allow-localhost:false}") boolean allowLocalhostInProd
    ) {
        this.jwtSecret = jwtSecret;
        this.h2ConsoleEnabled = h2ConsoleEnabled;
        this.bootstrapAdmin = bootstrapAdmin;
        this.seedDemoData = seedDemoData;
        this.syncExistingAdmin = syncExistingAdmin;
        this.adminPassword = adminPassword;
        this.datasourceUrl = datasourceUrl;
        this.frontendBaseUrl = frontendBaseUrl;
        this.corsAllowedOrigins = corsAllowedOrigins == null ? List.of() : corsAllowedOrigins.stream()
            .flatMap(value -> Stream.of(value.split(",")))
            .map(String::trim)
            .filter(value -> !value.isEmpty())
            .distinct()
            .toList();
        this.emailEnabled = emailEnabled;
        this.mailHost = mailHost;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
        this.captchaEnabled = captchaEnabled;
        this.captchaSecretKey = captchaSecretKey;
        this.rateLimitRedisEnabled = rateLimitRedisEnabled;
        this.refreshCookieSecure = refreshCookieSecure;
        this.allowLocalhostInProd = allowLocalhostInProd;
    }

    @Override
    public void run(ApplicationArguments args) {
        validate();
    }

    void validate() {
        List<String> issues = new ArrayList<>();

        if (!StringUtils.hasText(jwtSecret) || jwtSecret.length() < 32 || DEFAULT_JWT_SECRET.equals(jwtSecret)) {
            issues.add("JWT_SECRET must be set to a strong value with at least 32 characters.");
        }
        if (h2ConsoleEnabled) {
            issues.add("H2 console must stay disabled in the prod profile.");
        }
        if (!allowLocalhostInProd && syncExistingAdmin) {
            issues.add("Bootstrap admin sync must stay disabled in the prod profile.");
        }
        if (seedDemoData) {
            issues.add("Demo data seeding must stay disabled in the prod profile.");
        }
        if (bootstrapAdmin && isWeakBootstrapAdminPassword(adminPassword)) {
            issues.add("APP_ADMIN_PASSWORD must be set to a strong non-placeholder value when bootstrap admin creation is enabled in production.");
        }
        if (!StringUtils.hasText(datasourceUrl) || datasourceUrl.startsWith("jdbc:h2:")) {
            issues.add("A production deployment must use a managed MySQL datasource, not the H2 fallback.");
        }
        if (!allowLocalhostInProd && (!StringUtils.hasText(frontendBaseUrl)
                || frontendBaseUrl.contains("localhost")
                || frontendBaseUrl.contains("127.0.0.1"))) {
            issues.add("FRONTEND_BASE_URL must point to the public frontend host in production.");
        }
        if (!allowLocalhostInProd && corsAllowedOrigins.stream().anyMatch(this::isLocalhostOrigin)) {
            issues.add("APP_CORS_ALLOWED_ORIGINS must not include localhost in production.");
        }
        if (emailEnabled
                && (!StringUtils.hasText(mailHost)
                    || !StringUtils.hasText(mailUsername)
                    || !StringUtils.hasText(mailPassword))) {
            issues.add("SMTP host, username, and password are required when APP_EMAIL_ENABLED=true.");
        }
        if (captchaEnabled && !StringUtils.hasText(captchaSecretKey)) {
            issues.add("Turnstile secret key is required when captcha is enabled.");
        }
        if (!rateLimitRedisEnabled) {
            issues.add("Redis-backed rate limiting must stay enabled in the prod profile.");
        }
        if (!refreshCookieSecure) {
            issues.add("Refresh auth cookie must be secure in the prod profile.");
        }

        if (!issues.isEmpty()) {
            throw new IllegalStateException("Production deployment validation failed:\n - " + String.join("\n - ", issues));
        }
    }

    private boolean isLocalhostOrigin(String origin) {
        return origin.contains("localhost") || origin.contains("127.0.0.1");
    }

    private boolean isWeakBootstrapAdminPassword(String password) {
        if (!StringUtils.hasText(password)) {
            return true;
        }
        String normalized = password.trim().toLowerCase();
        return normalized.length() < 12
                || List.of("password", "admin", "change-this-admin-password", "changeme", "campusfix").contains(normalized);
    }
}
