package com.campus.maintenance.controller;

import com.campus.maintenance.dto.AuthDtos;
import com.campus.maintenance.service.SocialLinkService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final SocialLinkService socialLinkService;

    public PublicController(SocialLinkService socialLinkService) {
        this.socialLinkService = socialLinkService;
    }

    @GetMapping("/social-links")
    public ResponseEntity<List<AuthDtos.SocialLinkResponse>> socialLinks() {
        return ResponseEntity.ok(socialLinkService.listLinks());
    }

    @PostMapping("/social-links/{platform}/click")
    public ResponseEntity<AuthDtos.SocialLinkResponse> click(@PathVariable String platform) {
        return ResponseEntity.ok(socialLinkService.trackClick(platform));
    }
}
