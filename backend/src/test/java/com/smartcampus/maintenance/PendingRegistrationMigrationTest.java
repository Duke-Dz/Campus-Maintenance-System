package com.smartcampus.maintenance;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

class PendingRegistrationMigrationTest {

    @Test
    void v5MovesUnverifiedUsersIntoPendingRegistrations() throws Exception {
        String databaseName = "pendingreg_" + UUID.randomUUID().toString().replace("-", "");
        String jdbcUrl = "jdbc:h2:mem:" + databaseName + ";MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";

        Flyway.configure()
                .dataSource(jdbcUrl, "sa", "")
                .locations("classpath:db/migration")
                .target("4")
                .load()
                .migrate();

        try (Connection connection = DriverManager.getConnection(jdbcUrl, "sa", "");
                Statement statement = connection.createStatement()) {
            statement.executeUpdate("""
                    insert into users (
                        id, username, email, password_hash, role, full_name, email_verified, token_version, created_at
                    ) values (
                        1001, 'legacy_pending', 'legacy.pending@example.com', 'hashed-password', 'STUDENT',
                        'Legacy Pending', false, 0, CURRENT_TIMESTAMP()
                    )
                    """);
            statement.executeUpdate("""
                    insert into audit_events (
                        id, actor_user_id, actor_username, actor_role, action, target_type, target_id, created_at
                    ) values (
                        501, 1001, 'legacy_pending', 'STUDENT', 'auth.registered', 'user', '1001', CURRENT_TIMESTAMP()
                    )
                    """);
        }

        Flyway.configure()
                .dataSource(jdbcUrl, "sa", "")
                .locations("classpath:db/migration")
                .load()
                .migrate();

        try (Connection connection = DriverManager.getConnection(jdbcUrl, "sa", "");
                Statement statement = connection.createStatement()) {
            var pendingRows = statement.executeQuery("""
                    select username, email, full_name, password_hash
                    from pending_registrations
                    where email = 'legacy.pending@example.com'
                    """);
            assertThat(pendingRows.next()).isTrue();
            assertThat(pendingRows.getString("username")).isEqualTo("legacy_pending");
            assertThat(pendingRows.getString("full_name")).isEqualTo("Legacy Pending");
            assertThat(pendingRows.getString("password_hash")).isEqualTo("hashed-password");

            var userRows = statement.executeQuery("""
                    select count(*)
                    from users
                    where email = 'legacy.pending@example.com'
                    """);
            assertThat(userRows.next()).isTrue();
            assertThat(userRows.getInt(1)).isZero();

            var auditRows = statement.executeQuery("""
                    select actor_user_id, actor_username
                    from audit_events
                    where id = 501
                    """);
            assertThat(auditRows.next()).isTrue();
            assertThat(auditRows.getObject("actor_user_id")).isNull();
            assertThat(auditRows.getString("actor_username")).isEqualTo("legacy_pending");
        }
    }
}
