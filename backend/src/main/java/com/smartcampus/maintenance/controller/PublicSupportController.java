package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.support.SupportContactRequest;
import com.smartcampus.maintenance.dto.support.SupportContactResponse;
import com.smartcampus.maintenance.service.SupportRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicSupportController {

    private final SupportRequestService supportRequestService;

    public PublicSupportController(SupportRequestService supportRequestService) {
        this.supportRequestService = supportRequestService;
    }

    @PostMapping("/contact-support")
    @ResponseStatus(HttpStatus.CREATED)
    public SupportContactResponse submitSupportRequest(@Valid @RequestBody SupportContactRequest request) {
        return supportRequestService.submit(request);
    }
}
