package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.auth.AcceptStaffInviteRequest;
import com.smartcampus.maintenance.dto.auth.AuthResponse;
import com.smartcampus.maintenance.dto.auth.CurrentUserResponse;
import com.smartcampus.maintenance.dto.auth.LoginRequest;
import com.smartcampus.maintenance.dto.auth.RegisterRequest;
import com.smartcampus.maintenance.entity.AuthMfaChallenge;
import com.smartcampus.maintenance.entity.PasswordResetToken;
import com.smartcampus.maintenance.entity.PendingRegistration;
import com.smartcampus.maintenance.entity.StaffInvite;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.event.PendingRegistrationVerificationRequestedEvent;
import com.smartcampus.maintenance.event.PendingRegistrationVerifiedEvent;
import com.smartcampus.maintenance.exception.BadRequestException;
import com.smartcampus.maintenance.exception.ConflictException;
import com.smartcampus.maintenance.exception.UnauthorizedException;
import com.smartcampus.maintenance.repository.AuthMfaChallengeRepository;
import com.smartcampus.maintenance.repository.PasswordResetTokenRepository;
import com.smartcampus.maintenance.repository.PendingRegistrationRepository;
import com.smartcampus.maintenance.repository.StaffInviteRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.security.JwtService;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final AuthMfaChallengeRepository mfaChallengeRepository;
    private final StaffInviteRepository staffInviteRepository;
    private final UserService userService;
    private final PasswordPolicyService passwordPolicyService;
    private final TokenHashService tokenHashService;
    private final EmailService emailService;
    private final AuthRefreshTokenService authRefreshTokenService;
    private final RefreshCookieService refreshCookieService;
    private final AuditEventService auditEventService;
    private final ApplicationEventPublisher eventPublisher;
    private final TransactionTemplate requiresNewTransactionTemplate;
    private final String frontendBaseUrl;
    private final long verificationCodeTtlMinutes;
    private final long resetTokenTtlMinutes;
    private final long verificationResendCooldownSeconds;
    private final long resetRequestCooldownSeconds;
    private final long mfaCodeTtlMinutes;
    private final long mfaResendCooldownSeconds;
    private final int mfaCodeMaxAttempts;
    private final Set<String> mfaRequiredRoles;
    private final long publicRequestMinDelayMs;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PendingRegistrationRepository pendingRegistrationRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PasswordResetTokenRepository resetTokenRepository,
            AuthMfaChallengeRepository mfaChallengeRepository,
            StaffInviteRepository staffInviteRepository,
            UserService userService,
            PasswordPolicyService passwordPolicyService,
            TokenHashService tokenHashService,
            EmailService emailService,
            AuthRefreshTokenService authRefreshTokenService,
            RefreshCookieService refreshCookieService,
            AuditEventService auditEventService,
            ApplicationEventPublisher eventPublisher,
            PlatformTransactionManager transactionManager,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
            @Value("${app.auth.verification-code-ttl-minutes:15}") long verificationCodeTtlMinutes,
            @Value("${app.auth.reset-token-ttl-minutes:60}") long resetTokenTtlMinutes,
            @Value("${app.auth.verification-resend-cooldown-seconds:60}") long verificationResendCooldownSeconds,
            @Value("${app.auth.reset-request-cooldown-seconds:60}") long resetRequestCooldownSeconds,
            @Value("${app.auth.mfa.code-ttl-minutes:10}") long mfaCodeTtlMinutes,
            @Value("${app.auth.mfa.resend-cooldown-seconds:45}") long mfaResendCooldownSeconds,
            @Value("${app.auth.mfa.code-max-attempts:5}") int mfaCodeMaxAttempts,
            @Value("${app.auth.mfa.required-roles:}") List<String> mfaRequiredRoles,
            @Value("${app.auth.public-request-min-delay-ms:350}") long publicRequestMinDelayMs) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.resetTokenRepository = resetTokenRepository;
        this.mfaChallengeRepository = mfaChallengeRepository;
        this.staffInviteRepository = staffInviteRepository;
        this.userService = userService;
        this.passwordPolicyService = passwordPolicyService;
        this.tokenHashService = tokenHashService;
        this.emailService = emailService;
        this.authRefreshTokenService = authRefreshTokenService;
        this.refreshCookieService = refreshCookieService;
        this.auditEventService = auditEventService;
        this.eventPublisher = eventPublisher;
        this.requiresNewTransactionTemplate = new TransactionTemplate(transactionManager);
        this.requiresNewTransactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.frontendBaseUrl = frontendBaseUrl;
        this.verificationCodeTtlMinutes = verificationCodeTtlMinutes;
        this.resetTokenTtlMinutes = resetTokenTtlMinutes;
        this.verificationResendCooldownSeconds = verificationResendCooldownSeconds;
        this.resetRequestCooldownSeconds = resetRequestCooldownSeconds;
        this.mfaCodeTtlMinutes = Math.max(1, mfaCodeTtlMinutes);
        this.mfaResendCooldownSeconds = Math.max(0, mfaResendCooldownSeconds);
        this.mfaCodeMaxAttempts = Math.max(1, mfaCodeMaxAttempts);
        this.mfaRequiredRoles = (mfaRequiredRoles == null ? List.<String>of() : mfaRequiredRoles).stream()
                .flatMap(value -> Stream.of(value.split(",")))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(String::toUpperCase)
                .collect(Collectors.toSet());
        this.publicRequestMinDelayMs = publicRequestMinDelayMs;
    }

    public AuthResponse login(LoginRequest request, RequestMetadata metadata, HttpHeaders responseHeaders) {
        String username = request.username().trim();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.password()));
        } catch (AuthenticationException ex) {
            auditEventService.record(
                    "auth.login.failed",
                    null,
                    "login",
                    username,
                    metadata,
                    Map.of("reason", "invalid_credentials"));
            throw new UnauthorizedException("Invalid credentials");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!user.isEmailVerified()) {
            auditEventService.record(
                    "auth.login.failed",
                    user,
                    "user",
                    String.valueOf(user.getId()),
                    metadata,
                    Map.of("reason", "email_not_verified"));
            throw new UnauthorizedException("Email not verified. Enter the verification code sent to your inbox first.");
        }

        if (requiresMfa(user)) {
            IssuedMfaChallenge challenge = issueMfaChallenge(user);
            long expiresInMinutes = Math.max(1, mfaCodeTtlMinutes);
            emailService.sendMfaCodeEmail(user.getFullName(), user.getEmail(), challenge.rawCode(), expiresInMinutes);
            auditEventService.record(
                    "auth.login.mfa_required",
                    user,
                    "user",
                    String.valueOf(user.getId()),
                    metadata,
                    Map.of("role", user.getRole().name()));
            return new AuthResponse(
                    null,
                    null,
                    user.getUsername(),
                    user.getFullName(),
                    user.getRole().name(),
                    true,
                    challenge.challengeId(),
                    "A sign-in code was sent to your email.");
        }

        AuthRefreshTokenService.IssuedRefreshToken refreshToken = authRefreshTokenService.issue(user, metadata);
        refreshCookieService.writeRefreshCookie(responseHeaders, refreshToken.rawToken(), durationUntil(refreshToken.expiresAt()));
        auditEventService.record(
                "auth.login.success",
                user,
                "user",
                String.valueOf(user.getId()),
                metadata,
                Map.of("role", user.getRole().name()));
        return buildAuthResponse(user);
    }

    public AuthResponse refreshSession(String rawRefreshToken, RequestMetadata metadata, HttpHeaders responseHeaders) {
        User user = authRefreshTokenService.consumeForRefresh(rawRefreshToken, metadata);
        AuthRefreshTokenService.IssuedRefreshToken rotatedToken = authRefreshTokenService.rotate(rawRefreshToken, user,
                metadata);
        refreshCookieService.writeRefreshCookie(responseHeaders, rotatedToken.rawToken(),
                durationUntil(rotatedToken.expiresAt()));
        auditEventService.record(
                "auth.refresh.success",
                user,
                "user",
                String.valueOf(user.getId()),
                metadata,
                Map.of("role", user.getRole().name()));
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse verifyMfa(String challengeId, String code, RequestMetadata metadata, HttpHeaders responseHeaders) {
        String normalizedChallengeId = challengeId == null ? "" : challengeId.trim();
        String normalizedCode = code == null ? "" : code.trim();
        if (normalizedChallengeId.isEmpty() || normalizedCode.isEmpty()) {
            throw new BadRequestException("Challenge ID and code are required.");
        }

        AuthMfaChallenge challenge = mfaChallengeRepository.findByChallengeIdAndConsumedFalse(normalizedChallengeId)
                .orElseThrow(() -> new BadRequestException("Invalid or expired sign-in challenge."));

        if (challenge.isExpired()) {
            challenge.setConsumed(true);
            mfaChallengeRepository.save(challenge);
            throw new BadRequestException("This sign-in code has expired. Request a new one.");
        }

        if (challenge.getAttemptCount() >= mfaCodeMaxAttempts) {
            challenge.setConsumed(true);
            mfaChallengeRepository.save(challenge);
            throw new BadRequestException("Too many invalid attempts. Request a new sign-in code.");
        }

        String codeHash = tokenHashService.hashSha256(normalizedCode);
        if (!codeHash.equals(challenge.getCodeHash())) {
            challenge.setAttemptCount(challenge.getAttemptCount() + 1);
            if (challenge.getAttemptCount() >= mfaCodeMaxAttempts) {
                challenge.setConsumed(true);
            }
            mfaChallengeRepository.save(challenge);
            throw new UnauthorizedException("Invalid sign-in code.");
        }

        User user = challenge.getUser();
        challenge.setConsumed(true);
        mfaChallengeRepository.save(challenge);

        AuthRefreshTokenService.IssuedRefreshToken refreshToken = authRefreshTokenService.issue(user, metadata);
        refreshCookieService.writeRefreshCookie(responseHeaders, refreshToken.rawToken(),
                durationUntil(refreshToken.expiresAt()));
        auditEventService.record(
                "auth.login.success",
                user,
                "user",
                String.valueOf(user.getId()),
                metadata,
                Map.of("role", user.getRole().name(), "mfa", "email_code"));
        return buildAuthResponse(user);
    }

    @Transactional
    public void resendMfaCode(String challengeId, RequestMetadata metadata) {
        String normalizedChallengeId = challengeId == null ? "" : challengeId.trim();
        if (normalizedChallengeId.isEmpty()) {
            throw new BadRequestException("Challenge ID is required.");
        }

        AuthMfaChallenge challenge = mfaChallengeRepository.findByChallengeIdAndConsumedFalse(normalizedChallengeId)
                .orElseThrow(() -> new BadRequestException("Invalid or expired sign-in challenge."));

        if (challenge.isExpired()) {
            challenge.setConsumed(true);
            mfaChallengeRepository.save(challenge);
            throw new BadRequestException("This sign-in challenge has expired. Sign in again.");
        }

        if (challenge.getResendAvailableAt() != null && challenge.getResendAvailableAt().isAfter(LocalDateTime.now())) {
            return;
        }

        String rawCode = generateNumericCode(6);
        LocalDateTime now = LocalDateTime.now();
        challenge.setCodeHash(tokenHashService.hashSha256(rawCode));
        challenge.setExpiresAt(now.plusMinutes(mfaCodeTtlMinutes));
        challenge.setResendAvailableAt(now.plusSeconds(mfaResendCooldownSeconds));
        challenge.setAttemptCount(0);
        mfaChallengeRepository.save(challenge);

        User user = challenge.getUser();
        emailService.sendMfaCodeEmail(user.getFullName(), user.getEmail(), rawCode, mfaCodeTtlMinutes);
        auditEventService.record(
                "auth.login.mfa_resent",
                user,
                "user",
                String.valueOf(user.getId()),
                metadata,
                Map.of());
    }

    public void logout(String rawRefreshToken, RequestMetadata metadata, HttpHeaders responseHeaders) {
        authRefreshTokenService.revoke(rawRefreshToken);
        refreshCookieService.clearRefreshCookie(responseHeaders);
        auditEventService.record(
                "auth.logout",
                null,
                "refresh_token",
                null,
                metadata,
                Map.of("hadCookie", rawRefreshToken != null && !rawRefreshToken.isBlank()));
    }

    public CurrentUserResponse currentUser(User user) {
        return new CurrentUserResponse(user.getUsername(), user.getFullName(), user.getRole().name());
    }

    @Transactional
    public void registerStudent(RegisterRequest request, RequestMetadata metadata) {
        long startedAtNs = System.nanoTime();
        try {
            String username = request.username().trim();
            String email = request.email().trim().toLowerCase();
            String fullName = request.fullName().trim();

            PendingRegistration existingPending = pendingRegistrationRepository.findByEmailIgnoreCase(email).orElse(null);
            ensureUsernameAvailable(username, fullName, existingPending == null ? null : existingPending.getId());

            if (userRepository.existsByEmailIgnoreCase(email)) {
                auditEventService.record(
                        "auth.register.duplicate_email",
                        null,
                        "email",
                        email,
                        metadata,
                        Map.of("email", email));
                return;
            }

            passwordPolicyService.enforce(request.password(), username, email, fullName);

            PendingRegistration pending = existingPending == null ? new PendingRegistration() : existingPending;
            pending.setUsername(username);
            pending.setEmail(email);
            pending.setFullName(fullName);
            pending.setPasswordHash(passwordEncoder.encode(request.password()));

            String verificationCode = rotateVerificationCode(pending);
            PendingRegistration saved = pendingRegistrationRepository.save(pending);

            eventPublisher.publishEvent(new PendingRegistrationVerificationRequestedEvent(
                    saved.getEmail(),
                    saved.getFullName(),
                    verificationCode,
                    verificationCodeTtlMinutes));
            auditEventService.record(
                    "auth.register.pending",
                    null,
                    "pending_registration",
                    String.valueOf(saved.getId()),
                    metadata,
                    Map.of("email", saved.getEmail(), "username", saved.getUsername()));
        } finally {
            enforceMinimumPublicDelay(startedAtNs);
        }
    }

    @Transactional
    public void verifyEmail(String email, String code, RequestMetadata metadata) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        String normalizedCode = code == null ? "" : code.trim();
        if (normalizedEmail.isEmpty() || normalizedCode.isEmpty()) {
            throw new BadRequestException("Email and verification code are required.");
        }

        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification code."));

        if (pending.isVerificationTokenExpired()) {
            clearVerificationCodeInNewTransaction(pending.getId());
            throw new BadRequestException("This verification code has expired. Request a new one.");
        }

        String codeHash = tokenHashService.hashSha256(normalizedCode);
        if (pending.getVerificationTokenHash() == null || !pending.getVerificationTokenHash().equals(codeHash)) {
            throw new BadRequestException("Invalid or expired verification code.");
        }

        if (userRepository.existsByEmailIgnoreCase(pending.getEmail())) {
            pendingRegistrationRepository.delete(pending);
            throw new BadRequestException("This verification code is no longer valid. Sign in or register again.");
        }
        if (userRepository.existsByUsernameIgnoreCase(pending.getUsername())) {
            pendingRegistrationRepository.delete(pending);
            throw new BadRequestException("This verification code is no longer valid. Register again to choose a different username.");
        }

        User user = new User();
        user.setUsername(pending.getUsername());
        user.setEmail(pending.getEmail());
        user.setFullName(pending.getFullName());
        user.setRole(Role.STUDENT);
        user.setEmailVerified(true);
        user.setPasswordHash(pending.getPasswordHash());
        User savedUser = userRepository.save(user);

        pendingRegistrationRepository.delete(pending);

        eventPublisher.publishEvent(new PendingRegistrationVerifiedEvent(
                savedUser.getEmail(),
                savedUser.getFullName(),
                buildLoginUrl()));
        auditEventService.record(
                "auth.verify_email.success",
                savedUser,
                "user",
                String.valueOf(savedUser.getId()),
                metadata,
                Map.of("email", savedUser.getEmail()));
    }

    @Transactional
    public void resendVerificationCode(String email, RequestMetadata metadata) {
        long startedAtNs = System.nanoTime();
        try {
            String normalizedEmail = email.trim().toLowerCase();
            PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
            if (pending == null) {
                if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                    log.info("Verification resend ignored for already-verified email: {}", normalizedEmail);
                } else {
                    log.info("Verification resend requested for unknown email: {}", normalizedEmail);
                    auditEventService.record(
                            "auth.verify_email.resend.unknown",
                            null,
                            "email",
                            normalizedEmail,
                            metadata,
                            Map.of());
                }
                return;
            }

            if (isResendCooldownActive(pending)) {
                log.info("Verification resend cooldown active for pending registration '{}'", pending.getEmail());
                return;
            }

            String verificationCode = rotateVerificationCode(pending);
            PendingRegistration saved = pendingRegistrationRepository.save(pending);
            eventPublisher.publishEvent(new PendingRegistrationVerificationRequestedEvent(
                    saved.getEmail(),
                    saved.getFullName(),
                    verificationCode,
                    verificationCodeTtlMinutes));
            auditEventService.record(
                    "auth.verify_email.resend",
                    null,
                    "pending_registration",
                    String.valueOf(saved.getId()),
                    metadata,
                    Map.of("email", saved.getEmail()));
        } finally {
            enforceMinimumPublicDelay(startedAtNs);
        }
    }

    @Transactional
    public void forgotPassword(String email, RequestMetadata metadata) {
        long startedAtNs = System.nanoTime();
        try {
            String normalizedEmail = email.trim().toLowerCase();
            User user = userRepository.findByEmail(normalizedEmail).orElse(null);

            if (user == null) {
                log.info("Password reset requested for unknown email: {}", normalizedEmail);
                auditEventService.record(
                        "auth.forgot_password.unknown",
                        null,
                        "email",
                        normalizedEmail,
                        metadata,
                        Map.of());
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
            resetToken.setToken(tokenHashService.hashSha256(rawToken));
            resetToken.setUser(user);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(resetTokenTtlMinutes));
            resetTokenRepository.save(resetToken);

            String resetUrl = buildResetUrl(rawToken);
            emailService.sendPasswordResetEmail(user.getFullName(), user.getEmail(), resetUrl, resetTokenTtlMinutes);
            log.info("Password reset link generated for user '{}'", user.getUsername());
            auditEventService.record(
                    "auth.forgot_password.requested",
                    user,
                    "user",
                    String.valueOf(user.getId()),
                    metadata,
                    Map.of("email", user.getEmail()));
        } finally {
            enforceMinimumPublicDelay(startedAtNs);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword, RequestMetadata metadata) {
        String tokenHash = tokenHashService.hashSha256(token.trim());
        PasswordResetToken resetToken = resetTokenRepository.findByTokenAndUsedFalse(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token."));

        if (resetToken.isExpired()) {
            throw new BadRequestException("This reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from your current password.");
        }
        passwordPolicyService.enforce(newPassword, user.getUsername(), user.getEmail(), user.getFullName());
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
        authRefreshTokenService.revokeAllForUser(user.getId());

        emailService.sendPasswordChangedEmail(user.getFullName(), user.getEmail(), buildLoginUrl());
        log.info("Password successfully reset for user: {}", user.getUsername());
        auditEventService.record(
                "auth.password_reset.success",
                user,
                "user",
                String.valueOf(user.getId()),
                metadata,
                Map.of());
    }

    @Transactional
    public void acceptStaffInvite(AcceptStaffInviteRequest request, RequestMetadata metadata) {
        String rawToken = request.token().trim();
        String username = request.username().trim();
        StaffInvite invite = staffInviteRepository
                .findByTokenHashAndUsedFalse(tokenHashService.hashSha256(rawToken))
                .orElseThrow(() -> new BadRequestException("Invalid or expired invite token."));

        if (invite.isExpired()) {
            invite.setUsed(true);
            staffInviteRepository.save(invite);
            throw new BadRequestException("This invite has expired. Ask an admin to send a new one.");
        }

        if (userService.isUsernameUnavailable(username)) {
            throw new ConflictException("Username is already in use. Choose a different username and try again.");
        }
        if (userRepository.existsByEmailIgnoreCase(invite.getEmail())) {
            throw new ConflictException("Email is already in use. Ask an admin to issue a new invite.");
        }

        passwordPolicyService.enforce(request.password(), username, invite.getEmail(), invite.getFullName());

        User user = new User();
        user.setUsername(username);
        user.setEmail(invite.getEmail());
        user.setFullName(invite.getFullName());
        user.setRole(Role.MAINTENANCE);
        user.setEmailVerified(true);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        invite.setUsername(username);
        invite.setUsed(true);
        invite.setAcceptedAt(LocalDateTime.now());
        staffInviteRepository.save(invite);

        emailService.sendWelcomeEmail(user.getFullName(), user.getEmail(), buildLoginUrl());
        auditEventService.record(
                "auth.staff_invite.accepted",
                user,
                "user",
                String.valueOf(user.getId()),
                metadata,
                Map.of("email", user.getEmail()));
    }

    @Transactional(readOnly = true)
    public List<String> getUsernameSuggestions(String preferredUsername, String fullName) {
        return userService.suggestAvailableUsernames(preferredUsername, fullName, 8);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        Instant expiresAt = jwtService.resolveExpirationInstant();
        return new AuthResponse(
                token,
                expiresAt.toString(),
                user.getUsername(),
                user.getFullName(),
                user.getRole().name(),
                false,
                null,
                null);
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

    private String generateUniqueResetToken() {
        for (int i = 0; i < 5; i++) {
            String rawToken = tokenHashService.generateUrlToken(32);
            if (!resetTokenRepository.existsByToken(tokenHashService.hashSha256(rawToken))) {
                return rawToken;
            }
        }
        throw new IllegalStateException("Unable to generate unique reset token");
    }

    private void ensureUsernameAvailable(String username, String fullName, Long pendingRegistrationId) {
        boolean verifiedUserExists = userRepository.existsByUsernameIgnoreCase(username);
        boolean pendingExists = pendingRegistrationId == null
                ? pendingRegistrationRepository.existsByUsernameIgnoreCase(username)
                : pendingRegistrationRepository.existsByUsernameIgnoreCaseAndIdNot(username, pendingRegistrationId);
        if (verifiedUserExists || pendingExists) {
            List<String> suggestions = userService.suggestAvailableUsernames(username, fullName, 5);
            throw new ConflictException("Username is already in use. Try: " + String.join(", ", suggestions));
        }
    }

    private String rotateVerificationCode(PendingRegistration pending) {
        String verificationCode = generateNumericCode(6);
        LocalDateTime now = LocalDateTime.now();
        pending.setVerificationTokenHash(tokenHashService.hashSha256(verificationCode));
        pending.setVerificationTokenExpiresAt(now.plusMinutes(verificationCodeTtlMinutes));
        pending.setLastVerificationSentAt(now);
        pending.setResendAvailableAt(now.plusSeconds(verificationResendCooldownSeconds));
        return verificationCode;
    }

    private void clearVerificationCode(PendingRegistration pending) {
        pending.setVerificationTokenHash(null);
        pending.setVerificationTokenExpiresAt(null);
    }

    private void clearVerificationCodeInNewTransaction(Long pendingRegistrationId) {
        requiresNewTransactionTemplate.executeWithoutResult(status -> pendingRegistrationRepository
                .findById(pendingRegistrationId)
                .ifPresent(existing -> {
                    clearVerificationCode(existing);
                    pendingRegistrationRepository.save(existing);
                }));
    }

    private boolean requiresMfa(User user) {
        if (user == null) {
            return false;
        }
        if (user.isMfaEnabled()) {
            return true;
        }
        return mfaRequiredRoles.contains(user.getRole().name().toUpperCase());
    }

    private IssuedMfaChallenge issueMfaChallenge(User user) {
        String challengeId = tokenHashService.generateUrlToken(24);
        String rawCode = generateNumericCode(6);
        LocalDateTime now = LocalDateTime.now();

        AuthMfaChallenge challenge = new AuthMfaChallenge();
        challenge.setUser(user);
        challenge.setChallengeId(challengeId);
        challenge.setCodeHash(tokenHashService.hashSha256(rawCode));
        challenge.setExpiresAt(now.plusMinutes(mfaCodeTtlMinutes));
        challenge.setResendAvailableAt(now.plusSeconds(mfaResendCooldownSeconds));
        challenge.setAttemptCount(0);
        challenge.setConsumed(false);

        mfaChallengeRepository.save(challenge);
        return new IssuedMfaChallenge(challengeId, rawCode);
    }

    private String generateNumericCode(int length) {
        int safeLength = Math.max(4, length);
        int max = (int) Math.pow(10, safeLength);
        int number = secureRandom.nextInt(max);
        return String.format("%0" + safeLength + "d", number);
    }

    private boolean isResendCooldownActive(PendingRegistration pending) {
        return pending.getResendAvailableAt() != null && pending.getResendAvailableAt().isAfter(LocalDateTime.now());
    }

    private boolean isCooldownActive(LocalDateTime createdAt, long cooldownSeconds) {
        return cooldownSeconds > 0 && createdAt != null
                && createdAt.isAfter(LocalDateTime.now().minusSeconds(cooldownSeconds));
    }

    private Duration durationUntil(LocalDateTime expiresAt) {
        long seconds = Duration.between(LocalDateTime.now(), expiresAt).getSeconds();
        return Duration.ofSeconds(Math.max(0, seconds));
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
            java.util.concurrent.locks.LockSupport.parkNanos(remainingMs * 1_000_000);
        } catch (Exception ex) {
            Thread.currentThread().interrupt();
        }
    }

    private record IssuedMfaChallenge(String challengeId, String rawCode) {
    }
}
