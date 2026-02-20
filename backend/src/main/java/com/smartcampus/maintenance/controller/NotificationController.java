package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.notification.NotificationResponse;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.service.CurrentUserService;
import com.smartcampus.maintenance.service.NotificationService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public NotificationController(NotificationService notificationService, CurrentUserService currentUserService) {
        this.notificationService = notificationService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<NotificationResponse> getNotifications() {
        User actor = currentUserService.requireCurrentUser();
        return notificationService.getNotifications(actor);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        User actor = currentUserService.requireCurrentUser();
        return Map.of("count", notificationService.getUnreadCount(actor));
    }

    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        User actor = currentUserService.requireCurrentUser();
        notificationService.markRead(id, actor);
    }

    @PutMapping("/read-all")
    public void markAllRead() {
        User actor = currentUserService.requireCurrentUser();
        notificationService.markAllRead(actor);
    }
}
