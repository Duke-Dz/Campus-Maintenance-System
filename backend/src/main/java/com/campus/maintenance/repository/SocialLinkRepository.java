package com.campus.maintenance.repository;

import com.campus.maintenance.model.SocialLink;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
    Optional<SocialLink> findByPlatformIgnoreCase(String platform);
}
