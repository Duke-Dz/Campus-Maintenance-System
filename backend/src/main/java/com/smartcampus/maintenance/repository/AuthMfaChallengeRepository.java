package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.AuthMfaChallenge;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthMfaChallengeRepository extends JpaRepository<AuthMfaChallenge, Long> {

    Optional<AuthMfaChallenge> findByChallengeIdAndConsumedFalse(String challengeId);

    long deleteByExpiresAtBefore(LocalDateTime cutoff);

    long deleteByConsumedTrueAndCreatedAtBefore(LocalDateTime cutoff);
}
