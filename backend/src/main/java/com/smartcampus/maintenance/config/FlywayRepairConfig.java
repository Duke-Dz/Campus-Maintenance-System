package com.smartcampus.maintenance.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Runs Flyway repair before migrate to fix checksum mismatches
 * caused by modified migration files during development.
 *
 * <p>This is safe for development. In production, consider removing
 * this config and using immutable migrations exclusively.</p>
 */
@Configuration
public class FlywayRepairConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayRepairConfig.class);

    @Bean
    public FlywayMigrationStrategy repairThenMigrate() {
        return flyway -> {
            log.info("Running Flyway repair before migrate to fix any checksum mismatches...");
            flyway.repair();
            flyway.migrate();
        };
    }
}
