package com.smartcampus.maintenance.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class ProductionDeploymentValidatorTest {

    @Test
    void rejectsUnsafeProductionDefaults() {
        ProductionDeploymentValidator validator = new ProductionDeploymentValidator(
            ProductionDeploymentValidator.DEFAULT_JWT_SECRET,
            true,
            true,
            true,
            true,
            "password",
            "jdbc:h2:mem:testdb",
            "http://localhost:5173",
            List.of("http://localhost:5173"),
            false,
            "",
            "",
            "",
            false,
            "",
            false,
            false,
            false
        );

        assertThatThrownBy(validator::validate)
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("JWT_SECRET")
            .hasMessageContaining("H2 console")
            .hasMessageContaining("Bootstrap admin sync")
            .hasMessageContaining("APP_ADMIN_PASSWORD")
            .hasMessageContaining("Demo data seeding")
            .hasMessageContaining("H2 fallback")
            .hasMessageContaining("FRONTEND_BASE_URL")
            .hasMessageContaining("Redis-backed rate limiting")
            .hasMessageContaining("Refresh auth cookie");
    }

    @Test
    void requiresSmtpSettingsWhenEmailIsEnabled() {
        ProductionDeploymentValidator validator = new ProductionDeploymentValidator(
            "long-enough-production-secret-value-12345",
            false,
            false,
            false,
            false,
            "",
            "jdbc:mysql://mysql:3306/Campus_Fix",
            "https://app.example.com",
            List.of("https://app.example.com"),
            true,
            "",
            "smtp-user",
            "",
            false,
            "",
            true,
            true,
            false
        );

        assertThatThrownBy(validator::validate)
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("SMTP host, username, and password");
    }

    @Test
    void acceptsValidProductionSettings() {
        ProductionDeploymentValidator validator = new ProductionDeploymentValidator(
            "long-enough-production-secret-value-12345",
            false,
            false,
            false,
            false,
            "",
            "jdbc:mysql://mysql:3306/Campus_Fix",
            "https://app.example.com",
            List.of("https://app.example.com"),
            true,
            "smtp.example.com",
            "smtp-user",
            "smtp-password",
            true,
            "turnstile-secret",
            true,
            true,
            false
        );

        assertThatCode(validator::validate).doesNotThrowAnyException();
    }
}
