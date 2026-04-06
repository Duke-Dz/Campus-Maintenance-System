package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.repository.EmailVerificationTokenRepository;
import com.smartcampus.maintenance.repository.PasswordResetTokenRepository;
import com.smartcampus.maintenance.repository.AuthMfaChallengeRepository;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AuthTokenCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuthTokenCleanupScheduler.class);

    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final AuthMfaChallengeRepository mfaChallengeRepository;
    private final AuthRefreshTokenService authRefreshTokenService;
    private final long usedTokenRetentionHours;

    public AuthTokenCleanupScheduler(
            PasswordResetTokenRepository resetTokenRepository,
            EmailVerificationTokenRepository verificationTokenRepository,
            AuthMfaChallengeRepository mfaChallengeRepository,
            AuthRefreshTokenService authRefreshTokenService,
            @Value("${app.auth.used-token-retention-hours:24}") long usedTokenRetentionHours) {
        this.resetTokenRepository = resetTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.mfaChallengeRepository = mfaChallengeRepository;
        this.authRefreshTokenService = authRefreshTokenService;
        this.usedTokenRetentionHours = usedTokenRetentionHours;
    }

    @Scheduled(cron = "${app.auth.token-cleanup-cron:0 15 * * * *}")
    @Transactional
    public void cleanupAuthTokens() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime usedCutoff = now.minusHours(Math.max(0, usedTokenRetentionHours));

        long removedExpiredReset = resetTokenRepository.deleteByExpiresAtBefore(now);
        long removedUsedReset = resetTokenRepository.deleteByUsedTrueAndCreatedAtBefore(usedCutoff);
        long removedExpiredVerification = verificationTokenRepository.deleteByExpiresAtBefore(now);
        long removedUsedVerification = verificationTokenRepository.deleteByUsedTrueAndCreatedAtBefore(usedCutoff);
        long removedExpiredMfaChallenges = mfaChallengeRepository.deleteByExpiresAtBefore(now);
        long removedConsumedMfaChallenges = mfaChallengeRepository.deleteByConsumedTrueAndCreatedAtBefore(usedCutoff);
        long removedRefreshTokens = authRefreshTokenService.cleanupExpiredOrRevoked(now, usedCutoff);

        long totalRemoved = removedExpiredReset + removedUsedReset + removedExpiredVerification + removedUsedVerification
                + removedExpiredMfaChallenges + removedConsumedMfaChallenges
                + removedRefreshTokens;
        if (totalRemoved > 0) {
            log.info("Auth token cleanup removed {} records (reset expired {}, reset used {}, verification expired {}, verification used {}, mfa expired {}, mfa consumed {}, refresh {}).",
                    totalRemoved, removedExpiredReset, removedUsedReset, removedExpiredVerification, removedUsedVerification,
                    removedExpiredMfaChallenges, removedConsumedMfaChallenges,
                    removedRefreshTokens);
        }
    }
}
