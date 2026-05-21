package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.UserNotificationPreference;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, Long> {

    List<UserNotificationPreference> findByUser_IdOrderByEventKeyAsc(Long userId);

    Optional<UserNotificationPreference> findByUser_IdAndEventKey(Long userId, String eventKey);
}
