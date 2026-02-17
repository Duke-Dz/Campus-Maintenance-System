package com.campus.maintenance.repository;

import com.campus.maintenance.entity.TicketLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketLogRepository extends JpaRepository<TicketLog, Long> {
}
