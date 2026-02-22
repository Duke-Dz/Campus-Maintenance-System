package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.PasswordResetToken;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);

    Optional<PasswordResetToken> findTopByUser_IdAndUsedFalseOrderByCreatedAtDesc(Long userId);

    long countByUser_IdAndUsedFalse(Long userId);

    long deleteByExpiresAtBefore(LocalDateTime expiresAt);

    long deleteByUsedTrueAndCreatedAtBefore(LocalDateTime createdAt);

    boolean existsByToken(String token);

    void deleteByUser_IdAndUsedFalse(Long userId);
}
