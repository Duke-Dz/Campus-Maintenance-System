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

    @Test
    void directEmailServiceCallQueuesMessage() {
        String email = "direct_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";

        emailService.sendVerificationLinkEmail("Direct Queue", email, "http://localhost:5173/verify-email?token=test", 15);

        EmailOutbox queuedMessage = latestMessageFor(email);

        assertThat(queuedMessage.getSubject()).contains("Verify Your Email");
        assertThat(queuedMessage.getPlainTextBody()).contains("/verify-email?token=test");
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
        assertThat(queuedMessage.getPlainTextBody()).contains("/verify-email?token=");
        assertThat(queuedMessage.getHtmlBody()).contains("Verify Email");
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
        String rawToken = extractToken(latestMessageFor(request.email()).getPlainTextBody());

        authService.verifyEmail(rawToken, TEST_METADATA);

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

    private String extractToken(String body) {
        String marker = "token=";
        int start = body.indexOf(marker);
        if (start < 0) {
            throw new IllegalStateException("Verification token URL was not found in email body.");
        }
        int tokenStart = start + marker.length();
        int tokenEnd = body.indexOf('\n', tokenStart);
        if (tokenEnd < 0) {
            tokenEnd = body.length();
        }
        return body.substring(tokenStart, tokenEnd).trim();
    }
}
