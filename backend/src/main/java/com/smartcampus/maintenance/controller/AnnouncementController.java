package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.announcement.AnnouncementCreateRequest;
import com.smartcampus.maintenance.dto.announcement.AnnouncementResponse;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.service.AnnouncementService;
import com.smartcampus.maintenance.service.CurrentUserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final CurrentUserService currentUserService;

    public AnnouncementController(AnnouncementService announcementService, CurrentUserService currentUserService) {
        this.announcementService = announcementService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<AnnouncementResponse> getAnnouncements() {
        return announcementService.getActiveAnnouncements();
    }

    @GetMapping("/all")
    public List<AnnouncementResponse> getAllAnnouncements() {
        User actor = currentUserService.requireCurrentUser();
        return announcementService.getAllAnnouncements(actor);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementResponse create(@Valid @RequestBody AnnouncementCreateRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return announcementService.create(actor, request);
    }

    @PatchMapping("/{id}/toggle")
    public void toggleActive(@PathVariable Long id) {
        User actor = currentUserService.requireCurrentUser();
        announcementService.toggleActive(id, actor);
    }
}
