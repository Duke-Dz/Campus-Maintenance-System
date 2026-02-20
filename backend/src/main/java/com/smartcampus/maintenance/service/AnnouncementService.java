package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.announcement.AnnouncementCreateRequest;
import com.smartcampus.maintenance.dto.announcement.AnnouncementResponse;
import com.smartcampus.maintenance.entity.Announcement;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.exception.NotFoundException;
import com.smartcampus.maintenance.repository.AnnouncementRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getActiveAnnouncements() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAllAnnouncements(User actor) {
        requireAdmin(actor);
        return announcementRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AnnouncementResponse create(User actor, AnnouncementCreateRequest request) {
        requireAdmin(actor);
        Announcement a = new Announcement();
        a.setTitle(request.title().trim());
        a.setContent(request.content().trim());
        a.setCreatedBy(actor);
        a = announcementRepository.save(a);
        return toResponse(a);
    }

    @Transactional
    public void toggleActive(Long id, User actor) {
        requireAdmin(actor);
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Announcement not found"));
        a.setActive(!a.isActive());
        announcementRepository.save(a);
    }

    private AnnouncementResponse toResponse(Announcement a) {
        return new AnnouncementResponse(
                a.getId(), a.getTitle(), a.getContent(), a.isActive(),
                a.getCreatedBy().getUsername(), a.getCreatedBy().getFullName(),
                a.getCreatedAt());
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }
}
