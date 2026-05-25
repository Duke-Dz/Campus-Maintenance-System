package com.smartcampus.maintenance;

import static org.assertj.core.api.Assertions.assertThat;

import com.smartcampus.maintenance.dto.auth.RegisterRequest;
import com.smartcampus.maintenance.entity.EmailOutbox;
import com.smartcampus.maintenance.entity.PendingRegistration;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.repository.EmailOutboxRepository;
import com.smartcampus.maintenance.repository.PendingRegistrationRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.service.AuthService;
import com.smartcampus.maintenance.service.EmailService;
import com.smartcampus.maintenance.service.RequestMetadata;
import com.smartcampus.maintenance.service.TokenHashService;
import java.util.Comparator;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.email.enabled=true")
class RegistrationEmailOutboxIntegrationTest {

    private static final RequestMetadata TEST_METADATA = new RequestMetadata("127.0.0.1", "JUnit");

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private EmailOutboxRepository emailOutboxRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TokenHashService tokenHashService;

    @Test
    void directEmailServiceCallQueuesMessage() {
        String email = "direct_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";

        emailService.sendVerificationCodeEmail("Direct Queue", email, "123456", 15);

        EmailOutbox queuedMessage = latestMessageFor(email);

        assertThat(queuedMessage.getSubject()).contains("Verify Your Email");
        assertThat(queuedMessage.getPlainTextBody()).contains("123456");
    }

    @Test
    void registerStudentQueuesVerificationEmailAndStoresPendingRegistration() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest request = new RegisterRequest(
                "student_" + suffix,
                "student_" + suffix + "@example.com",
                "Student " + suffix,
                "StrongPass#123",
                "");

        authService.registerStudent(request, TEST_METADATA);

        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        EmailOutbox queuedMessage = latestMessageFor(request.email());

        assertThat(userRepository.findByEmail(request.email())).isEmpty();
        assertThat(pending.getUsername()).isEqualTo(request.username());
        assertThat(pending.getVerificationTokenHash()).isNotBlank();
        assertThat(queuedMessage.getSubject()).contains("Verify Your Email");
        assertThat(queuedMessage.getPlainTextBody()).isNotBlank();
        assertThat(queuedMessage.getHtmlBody()).contains("Verify");
    }

    @Test
    void verifyEmailPromotesPendingRegistrationAndQueuesWelcomeEmail() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest request = new RegisterRequest(
                "verify_" + suffix,
                "verify_" + suffix + "@example.com",
                "Verify " + suffix,
                "StrongPass#123",
                "");

        authService.registerStudent(request, TEST_METADATA);

        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        String rawCode = extractVerificationCode(pending, tokenHashService);

        authService.verifyEmail(request.email(), rawCode, TEST_METADATA);

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        EmailOutbox latestMessage = latestMessageFor(request.email());

        assertThat(user.isEmailVerified()).isTrue();
        assertThat(pendingRegistrationRepository.findByEmailIgnoreCase(request.email())).isEmpty();
        assertThat(latestMessage.getSubject()).contains("Welcome to CampusFix");
    }

    private EmailOutbox latestMessageFor(String email) {
        long deadline = System.currentTimeMillis() + 2_000;
        while (System.currentTimeMillis() < deadline) {
            var latest = emailOutboxRepository.findAll().stream()
                    .filter(message -> email.equalsIgnoreCase(message.getToEmail()))
                    .max(Comparator.comparing(EmailOutbox::getId));
            if (latest.isPresent()) {
                return latest.get();
            }
            try {
                Thread.sleep(50);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        return emailOutboxRepository.findAll().stream()
                .filter(message -> email.equalsIgnoreCase(message.getToEmail()))
                .max(Comparator.comparing(EmailOutbox::getId))
                .orElseThrow();
    }

    private String extractVerificationCode(PendingRegistration pending, TokenHashService hashService) {
        // Brute-force a numeric code whose SHA-256 matches the stored hash (for test only).
        // Codes are 6-digit numeric: 000000–999999.
        String storedHash = pending.getVerificationTokenHash();
        for (int i = 0; i <= 999999; i++) {
            String candidate = String.format("%06d", i);
            if (hashService.hashSha256(candidate).equals(storedHash)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not reverse verification code from hash");
    }
}
