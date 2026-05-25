package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.Notification;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(Long userId, LocalDateTime cutoff);

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndReadFalseAndCreatedAtGreaterThanEqual(Long userId, LocalDateTime cutoff);
}
