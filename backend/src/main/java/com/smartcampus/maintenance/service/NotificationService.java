package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.notification.NotificationResponse;
import com.smartcampus.maintenance.entity.Notification;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.NotificationType;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.exception.NotFoundException;
import com.smartcampus.maintenance.repository.NotificationRepository;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notify(User user, String title, String message, NotificationType type, String linkUrl) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setLinkUrl(linkUrl);
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(User actor) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(actor.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User actor) {
        return notificationRepository.countByUserIdAndReadFalse(actor.getId());
    }

    @Transactional
    public void markRead(Long notificationId, User actor) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!Objects.equals(n.getUser().getId(), actor.getId())) {
            throw new ForbiddenException("Cannot mark another user's notification as read");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(User actor) {
        notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(actor.getId())
                .forEach(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getTitle(), n.getMessage(),
                n.getType().name(), n.isRead(), n.getLinkUrl(), n.getCreatedAt());
    }
}
