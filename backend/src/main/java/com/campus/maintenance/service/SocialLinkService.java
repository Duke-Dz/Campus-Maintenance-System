package com.campus.maintenance.service;

import com.campus.maintenance.dto.AuthDtos;
import com.campus.maintenance.model.SocialLink;
import com.campus.maintenance.repository.SocialLinkRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SocialLinkService {
    private final SocialLinkRepository socialLinkRepository;

    public SocialLinkService(SocialLinkRepository socialLinkRepository) {
        this.socialLinkRepository = socialLinkRepository;
    }

    public List<AuthDtos.SocialLinkResponse> listLinks() {
        return socialLinkRepository.findAll().stream()
                .map(link -> new AuthDtos.SocialLinkResponse(link.getPlatform(), link.getUrl(), link.getClickCount()))
                .toList();
    }

    public AuthDtos.SocialLinkResponse trackClick(String platform) {
        SocialLink link = socialLinkRepository.findByPlatformIgnoreCase(platform)
                .orElseThrow(() -> new IllegalArgumentException("Social platform not configured"));
        link.setClickCount(link.getClickCount() + 1);
        SocialLink saved = socialLinkRepository.save(link);
        return new AuthDtos.SocialLinkResponse(saved.getPlatform(), saved.getUrl(), saved.getClickCount());
    }
}
