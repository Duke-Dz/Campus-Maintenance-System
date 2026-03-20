package com.smartcampus.maintenance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.smartcampus.maintenance.dto.auth.RegisterRequest;
import com.smartcampus.maintenance.entity.EmailOutbox;
import com.smartcampus.maintenance.entity.PasswordResetToken;
import com.smartcampus.maintenance.entity.PendingRegistration;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.BadRequestException;
import com.smartcampus.maintenance.repository.EmailOutboxRepository;
import com.smartcampus.maintenance.repository.PasswordResetTokenRepository;
import com.smartcampus.maintenance.repository.PendingRegistrationRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.security.CustomUserDetailsService;
import com.smartcampus.maintenance.security.JwtService;
import com.smartcampus.maintenance.service.AuthService;
import com.smartcampus.maintenance.service.RequestMetadata;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest(properties = "app.email.enabled=true")
class AuthSecurityServiceIntegrationTest {

    private static final RequestMetadata TEST_METADATA = new RequestMetadata("127.0.0.1", "JUnit");

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private EmailOutboxRepository emailOutboxRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void forgotPasswordUnknownEmailDoesNotCreateResetToken() {
        long before = resetTokenRepository.count();

        authService.forgotPassword("unknown." + UUID.randomUUID() + "@example.com", TEST_METADATA);

        assertThat(resetTokenRepository.count()).isEqualTo(before);
    }

    @Test
    void forgotPasswordCooldownPreventsMultipleResetTokens() {
        User user = createUser(true, "password");

        authService.forgotPassword(user.getEmail(), TEST_METADATA);
        PasswordResetToken firstToken = resetTokenRepository
                .findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow();
        long countAfterFirstRequest = resetTokenRepository.countByUser_IdAndUsedFalse(user.getId());

        authService.forgotPassword(user.getEmail(), TEST_METADATA);
        PasswordResetToken secondToken = resetTokenRepository
                .findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow();
        long countAfterSecondRequest = resetTokenRepository.countByUser_IdAndUsedFalse(user.getId());

        assertThat(countAfterFirstRequest).isEqualTo(1);
        assertThat(countAfterSecondRequest).isEqualTo(1);
        assertThat(secondToken.getId()).isEqualTo(firstToken.getId());
    }

    @Test
    void resendVerificationCooldownPreventsImmediateTokenRotation() {
        RegisterRequest request = pendingRegistrationRequest();

        authService.registerStudent(request, TEST_METADATA);
        PendingRegistration beforeResend = pendingRegistrationRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        String tokenHashBefore = beforeResend.getVerificationTokenHash();

        authService.resendVerificationCode(request.email(), TEST_METADATA);

        PendingRegistration afterResend = pendingRegistrationRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        assertThat(afterResend.getVerificationTokenHash()).isEqualTo(tokenHashBefore);
    }

    @Test
    void verifyEmailRejectsExpiredVerificationLink() {
        RegisterRequest request = pendingRegistrationRequest();

        authService.registerStudent(request, TEST_METADATA);
        String rawToken = latestVerificationToken(request.email());
        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        pending.setVerificationTokenExpiresAt(LocalDateTime.now().minusMinutes(1));
        pendingRegistrationRepository.save(pending);

        assertThatThrownBy(() -> authService.verifyEmail(rawToken, TEST_METADATA))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("expired");

        PendingRegistration updated = pendingRegistrationRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        assertThat(updated.getVerificationTokenHash()).isNull();
    }

    @Test
    void resetPasswordRejectsSamePasswordAndIncrementsTokenVersion() {
        User user = createUser(true, "OldPass#123");
        String rawResetToken = "reset-token-" + UUID.randomUUID();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(sha256(rawResetToken));
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        resetTokenRepository.save(resetToken);

        assertThatThrownBy(() -> authService.resetPassword(rawResetToken, "OldPass#123", TEST_METADATA))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must be different");

        authService.resetPassword(rawResetToken, "NewPass#123", TEST_METADATA);

        User updated = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updated.getTokenVersion()).isEqualTo(1);
        assertThat(passwordEncoder.matches("NewPass#123", updated.getPasswordHash())).isTrue();
    }

    @Test
    void oldJwtBecomesInvalidWhenTokenVersionChanges() {
        User user = createUser(true, "Password#123");
        String oldJwt = jwtService.generateToken(user);

        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        var updatedUserDetails = customUserDetailsService.loadUserByUsername(user.getUsername());
        assertThat(jwtService.isTokenValid(oldJwt, updatedUserDetails)).isFalse();
    }

    private RegisterRequest pendingRegistrationRequest() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        return new RegisterRequest(
                "pending_" + suffix,
                "pending_" + suffix + "@example.com",
                "Pending " + suffix,
                "StrongPass#123",
                "");
    }

    private String latestVerificationToken(String email) {
        EmailOutbox queuedMessage = emailOutboxRepository.findAll().stream()
                .filter(message -> email.equalsIgnoreCase(message.getToEmail()))
                .max(Comparator.comparing(EmailOutbox::getId))
                .orElseThrow();
        return extractToken(queuedMessage.getPlainTextBody());
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

    private User createUser(boolean emailVerified, String rawPassword) {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        User user = new User();
        user.setUsername("authsec_" + suffix);
        user.setEmail("authsec_" + suffix + "@example.com");
        user.setFullName("Auth Security " + suffix);
        user.setRole(Role.STUDENT);
        user.setEmailVerified(emailVerified);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm is not available", ex);
        }
    }
}
