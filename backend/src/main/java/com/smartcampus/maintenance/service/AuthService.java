package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.auth.AuthResponse;
import com.smartcampus.maintenance.dto.auth.LoginRequest;
import com.smartcampus.maintenance.dto.auth.RegisterRequest;
import com.smartcampus.maintenance.entity.EmailVerificationToken;
import com.smartcampus.maintenance.entity.PasswordResetToken;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.BadRequestException;
import com.smartcampus.maintenance.exception.ConflictException;
import com.smartcampus.maintenance.exception.UnauthorizedException;
import com.smartcampus.maintenance.repository.EmailVerificationTokenRepository;
import com.smartcampus.maintenance.repository.PasswordResetTokenRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final String frontendBaseUrl;
    private final long verificationCodeTtlMinutes;
    private final long resetTokenTtlMinutes;
    private final int verificationCodeMaxAttempts;
    private final long verificationResendCooldownSeconds;
    private final long resetRequestCooldownSeconds;
    private final long publicRequestMinDelayMs;
    private final SecureRandom secureRandom;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PasswordResetTokenRepository resetTokenRepository,
            EmailVerificationTokenRepository verificationTokenRepository,
            EmailService emailService,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
            @Value("${app.auth.verification-code-ttl-minutes:15}") long verificationCodeTtlMinutes,
            @Value("${app.auth.reset-token-ttl-minutes:60}") long resetTokenTtlMinutes,
            @Value("${app.auth.verification-code-max-attempts:5}") int verificationCodeMaxAttempts,
            @Value("${app.auth.verification-resend-cooldown-seconds:60}") long verificationResendCooldownSeconds,
            @Value("${app.auth.reset-request-cooldown-seconds:60}") long resetRequestCooldownSeconds,
            @Value("${app.auth.public-request-min-delay-ms:350}") long publicRequestMinDelayMs) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.resetTokenRepository = resetTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
        this.frontendBaseUrl = frontendBaseUrl;
        this.verificationCodeTtlMinutes = verificationCodeTtlMinutes;
        this.resetTokenTtlMinutes = resetTokenTtlMinutes;
        this.verificationCodeMaxAttempts = verificationCodeMaxAttempts;
        this.verificationResendCooldownSeconds = verificationResendCooldownSeconds;
        this.resetRequestCooldownSeconds = resetRequestCooldownSeconds;
        this.publicRequestMinDelayMs = publicRequestMinDelayMs;
        this.secureRandom = new SecureRandom();
    }

    public AuthResponse login(LoginRequest request) {
        String username = request.username().trim();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.password()));
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Invalid credentials");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Email not verified. Enter your verification code first.");
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public void registerStudent(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        String fullName = request.fullName().trim();

        if (userRepository.existsByUsername(username)) {
            throw new ConflictException("Username is already in use");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already in use");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(Role.STUDENT);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmailVerified(false);
        User saved = userRepository.save(user);
        issueEmailVerificationCode(saved);
    }

    @Transactional
    public void verifyEmail(String email, String code) {
        String normalizedEmail = email.trim().toLowerCase();
        String normalizedCode = code.trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid verification code."));

        if (user.isEmailVerified()) {
            return;
        }

        EmailVerificationToken token = verificationTokenRepository
                .findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new BadRequestException("Invalid verification code."));

        if (token.isExpired()) {
            token.setUsed(true);
            verificationTokenRepository.save(token);
            throw new BadRequestException("Verification code expired. Request a new code.");
        }

        if (!token.getCode().equals(normalizedCode)) {
            int attempts = token.getAttemptCount() + 1;
            token.setAttemptCount(attempts);
            if (attempts >= verificationCodeMaxAttempts) {
                token.setUsed(true);
            }
            verificationTokenRepository.save(token);

            if (attempts >= verificationCodeMaxAttempts) {
                throw new BadRequestException("Too many invalid attempts. Request a new code.");
            }
            throw new BadRequestException("Invalid verification code.");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        token.setUsed(true);
        verificationTokenRepository.save(token);

        emailService.sendWelcomeEmail(user.getFullName(), user.getEmail(), buildLoginUrl());
    }

    @Transactional
    public void resendVerificationCode(String email) {
        long startedAtNs = System.nanoTime();
        try {
            String normalizedEmail = email.trim().toLowerCase();
            User user = userRepository.findByEmail(normalizedEmail).orElse(null);
            if (user == null) {
                log.info("Verification resend requested for unknown email: {}", normalizedEmail);
                return;
            }
            if (user.isEmailVerified()) {
                log.info("Verification resend ignored for already-verified email: {}", normalizedEmail);
                return;
            }

            var activeToken = verificationTokenRepository.findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId());
            if (activeToken.isPresent() && isCooldownActive(activeToken.get().getCreatedAt(), verificationResendCooldownSeconds)
                    && !activeToken.get().isExpired()) {
                log.info("Verification resend cooldown active for user '{}'", user.getUsername());
                return;
            }
            issueEmailVerificationCode(user);
        } finally {
            enforceMinimumPublicDelay(startedAtNs);
        }
    }

    @Transactional
    public void forgotPassword(String email) {
        long startedAtNs = System.nanoTime();
        try {
            String normalizedEmail = email.trim().toLowerCase();
            User user = userRepository.findByEmail(normalizedEmail).orElse(null);

            // Always return success to prevent email enumeration
            if (user == null) {
                log.info("Password reset requested for unknown email: {}", normalizedEmail);
                return;
            }

            var latestResetToken = resetTokenRepository.findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(user.getId());
            if (latestResetToken.isPresent()
                    && isCooldownActive(latestResetToken.get().getCreatedAt(), resetRequestCooldownSeconds)
                    && !latestResetToken.get().isExpired()) {
                log.info("Password reset cooldown active for user '{}'", user.getUsername());
                return;
            }

            resetTokenRepository.deleteByUser_IdAndUsedFalse(user.getId());

            String rawToken = generateUniqueResetToken();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(hashToken(rawToken));
            resetToken.setUser(user);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(resetTokenTtlMinutes));
            resetTokenRepository.save(resetToken);

            String resetUrl = buildResetUrl(rawToken);
            emailService.sendPasswordResetEmail(user.getFullName(), user.getEmail(), resetUrl, resetTokenTtlMinutes);
            log.info("Password reset link generated for user '{}'", user.getUsername());
        } finally {
            enforceMinimumPublicDelay(startedAtNs);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        String tokenHash = hashToken(token.trim());
        PasswordResetToken resetToken = resetTokenRepository.findByTokenAndUsedFalse(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token."));

        if (resetToken.isExpired()) {
            throw new BadRequestException("This reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from your current password.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        emailService.sendPasswordChangedEmail(user.getFullName(), user.getEmail(), buildLoginUrl());
        log.info("Password successfully reset for user: {}", user.getUsername());
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getFullName(), user.getRole().name());
    }

    private String buildLoginUrl() {
        return UriComponentsBuilder
                .fromUriString(frontendBaseUrl)
                .path("/login")
                .build()
                .toUriString();
    }

    private String buildResetUrl(String token) {
        return UriComponentsBuilder
                .fromUriString(frontendBaseUrl)
                .path("/reset-password")
                .queryParam("token", token)
                .build()
                .toUriString();
    }

    private String buildVerifyEmailUrl(String email) {
        return UriComponentsBuilder
                .fromUriString(frontendBaseUrl)
                .path("/verify-email")
                .queryParam("email", email)
                .build()
                .toUriString();
    }

    private String generateUniqueResetToken() {
        for (int i = 0; i < 5; i++) {
            String rawToken = generateTokenValue();
            if (!resetTokenRepository.existsByToken(hashToken(rawToken))) {
                return rawToken;
            }
        }
        throw new IllegalStateException("Unable to generate unique reset token");
    }

    private String generateTokenValue() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void issueEmailVerificationCode(User user) {
        verificationTokenRepository.deleteByUser_IdAndUsedFalse(user.getId());

        String code = generateVerificationCode();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setCode(code);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(verificationCodeTtlMinutes));
        verificationTokenRepository.save(token);

        emailService.sendVerificationCodeEmail(
                user.getFullName(),
                user.getEmail(),
                code,
                verificationCodeTtlMinutes,
                buildVerifyEmailUrl(user.getEmail()));
    }

    private String generateVerificationCode() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    private boolean isCooldownActive(LocalDateTime createdAt, long cooldownSeconds) {
        return cooldownSeconds > 0 && createdAt != null
                && createdAt.isAfter(LocalDateTime.now().minusSeconds(cooldownSeconds));
    }

    private void enforceMinimumPublicDelay(long startedAtNs) {
        if (publicRequestMinDelayMs <= 0) {
            return;
        }
        long elapsedMs = (System.nanoTime() - startedAtNs) / 1_000_000;
        long remainingMs = publicRequestMinDelayMs - elapsedMs;
        if (remainingMs <= 0) {
            return;
        }
        try {
            Thread.sleep(remainingMs);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm is not available", ex);
        }
    }
}
