package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.EmailVerificationToken;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByUser_IdAndCodeAndUsedFalse(Long userId, String code);

    Optional<EmailVerificationToken> findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(Long userId);

    long deleteByExpiresAtBefore(LocalDateTime expiresAt);

    long deleteByUsedTrueAndCreatedAtBefore(LocalDateTime createdAt);

    void deleteByUser_IdAndUsedFalse(Long userId);
}
