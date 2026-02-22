package com.smartcampus.maintenance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.smartcampus.maintenance.entity.EmailVerificationToken;
import com.smartcampus.maintenance.entity.PasswordResetToken;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.BadRequestException;
import com.smartcampus.maintenance.repository.EmailVerificationTokenRepository;
import com.smartcampus.maintenance.repository.PasswordResetTokenRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.security.CustomUserDetailsService;
import com.smartcampus.maintenance.security.JwtService;
import com.smartcampus.maintenance.service.AuthService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class AuthSecurityServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private EmailVerificationTokenRepository verificationTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void forgotPasswordUnknownEmailDoesNotCreateResetToken() {
        long before = resetTokenRepository.count();

        authService.forgotPassword("unknown." + UUID.randomUUID() + "@example.com");

        assertThat(resetTokenRepository.count()).isEqualTo(before);
    }

    @Test
    void forgotPasswordCooldownPreventsMultipleResetTokens() {
        User user = createUser(true, "password");

        authService.forgotPassword(user.getEmail());
        PasswordResetToken firstToken = resetTokenRepository
                .findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow();
        long countAfterFirstRequest = resetTokenRepository.countByUser_IdAndUsedFalse(user.getId());

        authService.forgotPassword(user.getEmail());
        PasswordResetToken secondToken = resetTokenRepository
                .findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow();
        long countAfterSecondRequest = resetTokenRepository.countByUser_IdAndUsedFalse(user.getId());

        assertThat(countAfterFirstRequest).isEqualTo(1);
        assertThat(countAfterSecondRequest).isEqualTo(1);
        assertThat(secondToken.getId()).isEqualTo(firstToken.getId());
    }

    @Test
    void verifyEmailLocksTokenAfterTooManyInvalidAttempts() {
        User user = createUser(false, "password");

        authService.resendVerificationCode(user.getEmail());
        EmailVerificationToken activeToken = verificationTokenRepository
                .findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow();

        String wrongCode = activeToken.getCode().equals("999999") ? "888888" : "999999";

        for (int i = 0; i < 4; i++) {
            assertThatThrownBy(() -> authService.verifyEmail(user.getEmail(), wrongCode))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid verification code.");
        }

        assertThatThrownBy(() -> authService.verifyEmail(user.getEmail(), wrongCode))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Too many invalid attempts");

        assertThat(verificationTokenRepository.findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId()))
                .isEmpty();
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

        assertThatThrownBy(() -> authService.resetPassword(rawResetToken, "OldPass#123"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must be different");

        authService.resetPassword(rawResetToken, "NewPass#123");

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
