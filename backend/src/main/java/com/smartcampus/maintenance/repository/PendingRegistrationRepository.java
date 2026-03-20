package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.PendingRegistration;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, Long> {

    Optional<PendingRegistration> findByEmailIgnoreCase(String email);

    Optional<PendingRegistration> findByUsernameIgnoreCase(String username);

    Optional<PendingRegistration> findByVerificationTokenHash(String verificationTokenHash);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByUsernameIgnoreCaseAndIdNot(String username, Long id);
}
