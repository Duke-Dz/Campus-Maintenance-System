package com.campus.maintenance.repository;

import com.campus.maintenance.model.PasswordResetCode;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findTopByEmailAndCodeAndUsedFalseOrderByIdDesc(String email, String code);
    void deleteByEmailOrExpiresAtBefore(String email, LocalDateTime expiry);
}
