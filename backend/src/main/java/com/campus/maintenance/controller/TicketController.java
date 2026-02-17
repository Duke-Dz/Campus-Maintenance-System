package com.campus.maintenance.controller;

import com.campus.maintenance.dto.TicketRequest;
import com.campus.maintenance.entity.Ticket;
import com.campus.maintenance.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public Ticket create(@RequestBody TicketRequest request,
            Authentication authentication) {
        return ticketService.createTicket(request, authentication.getName());
    }

    @GetMapping
    public List<Ticket> getAll() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/my")
    public List<Ticket> getMy(Authentication authentication) {
        return ticketService.getUserTickets(authentication.getName());
    }

    @GetMapping("/assigned")
    public List<Ticket> getAssigned(Authentication authentication) {
        return ticketService.getAssignedTickets(authentication.getName());
    }

    @PutMapping("/{id}")
    public Ticket updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ticketService.updateStatus(id, status);
    }
}