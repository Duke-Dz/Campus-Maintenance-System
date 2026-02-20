package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.support.SupportContactRequest;
import com.smartcampus.maintenance.dto.support.SupportContactResponse;
import com.smartcampus.maintenance.entity.SupportRequest;
import com.smartcampus.maintenance.repository.SupportRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupportRequestService {

    private final SupportRequestRepository supportRequestRepository;
    private final EmailService emailService;

    public SupportRequestService(SupportRequestRepository supportRequestRepository, EmailService emailService) {
        this.supportRequestRepository = supportRequestRepository;
        this.emailService = emailService;
    }

    @Transactional
    public SupportContactResponse submit(SupportContactRequest request) {
        SupportRequest entity = new SupportRequest();
        entity.setFullName(request.fullName().trim());
        entity.setEmail(request.email().trim());
        entity.setCategory(request.category().trim());
        entity.setSubject(request.subject().trim());
        entity.setMessage(request.message().trim());

        SupportRequest saved = supportRequestRepository.save(entity);

        emailService.sendSupportRequestEmail(
            saved.getFullName(),
            saved.getEmail(),
            saved.getCategory(),
            saved.getSubject(),
            saved.getMessage()
        );

        return new SupportContactResponse(saved.getId(), "Support request submitted successfully.");
    }
}
