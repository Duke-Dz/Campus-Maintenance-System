package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.repository.EmailVerificationTokenRepository;
import com.smartcampus.maintenance.repository.PasswordResetTokenRepository;
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
    private final long usedTokenRetentionHours;

    public AuthTokenCleanupScheduler(
            PasswordResetTokenRepository resetTokenRepository,
            EmailVerificationTokenRepository verificationTokenRepository,
            @Value("${app.auth.used-token-retention-hours:24}") long usedTokenRetentionHours) {
        this.resetTokenRepository = resetTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
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

        long totalRemoved = removedExpiredReset + removedUsedReset + removedExpiredVerification + removedUsedVerification;
        if (totalRemoved > 0) {
            log.info("Auth token cleanup removed {} records (reset expired {}, reset used {}, verification expired {}, verification used {}).",
                    totalRemoved, removedExpiredReset, removedUsedReset, removedExpiredVerification, removedUsedVerification);
        }
    }
}
