package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.TicketLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketLogRepository extends JpaRepository<TicketLog, Long> {

    List<TicketLog> findByTicketIdOrderByTimestampAsc(Long ticketId);
}
