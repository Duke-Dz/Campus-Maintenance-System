package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.ticket.TicketAssignRequest;
import com.smartcampus.maintenance.dto.ticket.TicketCreateRequest;
import com.smartcampus.maintenance.dto.ticket.TicketDetailResponse;
import com.smartcampus.maintenance.dto.ticket.TicketLogResponse;
import com.smartcampus.maintenance.dto.ticket.TicketRateRequest;
import com.smartcampus.maintenance.dto.ticket.TicketRatingResponse;
import com.smartcampus.maintenance.dto.ticket.TicketResponse;
import com.smartcampus.maintenance.dto.ticket.TicketStatusUpdateRequest;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.TicketCategory;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import com.smartcampus.maintenance.service.CurrentUserService;
import com.smartcampus.maintenance.service.TicketService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    public TicketController(TicketService ticketService, CurrentUserService currentUserService) {
        this.ticketService = ticketService;
        this.currentUserService = currentUserService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(@Valid @RequestBody TicketCreateRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.createTicket(actor, request, null);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicketWithImage(
        @Valid @RequestPart("data") TicketCreateRequest request,
        @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.createTicket(actor, request, image);
    }

    @GetMapping
    public List<TicketResponse> getAllTickets(
        @RequestParam(value = "status", required = false) TicketStatus status,
        @RequestParam(value = "category", required = false) TicketCategory category,
        @RequestParam(value = "urgency", required = false) UrgencyLevel urgency,
        @RequestParam(value = "assignee", required = false) Long assigneeId,
        @RequestParam(value = "search", required = false) String search
    ) {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.getAllTickets(actor, status, category, urgency, assigneeId, search);
    }

    @GetMapping("/my")
    public List<TicketResponse> getMyTickets() {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.getMyTickets(actor);
    }

    @GetMapping("/assigned")
    public List<TicketResponse> getAssignedTickets() {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.getAssignedTickets(actor);
    }

    @GetMapping("/{id}")
    public TicketDetailResponse getTicket(@PathVariable Long id) {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.getTicketDetail(id, actor);
    }

    @PatchMapping("/{id}/status")
    public TicketResponse updateStatus(@PathVariable Long id, @Valid @RequestBody TicketStatusUpdateRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.updateStatus(id, request, actor);
    }

    @PatchMapping("/{id}/assign")
    public TicketResponse assignTicket(@PathVariable Long id, @Valid @RequestBody TicketAssignRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.assignTicket(id, request, actor);
    }

    @PostMapping("/{id}/rate")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketRatingResponse rateTicket(@PathVariable Long id, @Valid @RequestBody TicketRateRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.rateTicket(id, request, actor);
    }

    @GetMapping("/{id}/logs")
    public List<TicketLogResponse> getTicketLogs(@PathVariable Long id) {
        User actor = currentUserService.requireCurrentUser();
        return ticketService.getLogs(id, actor);
    }
}
