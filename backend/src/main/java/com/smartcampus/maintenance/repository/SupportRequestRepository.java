package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.SupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {
}
