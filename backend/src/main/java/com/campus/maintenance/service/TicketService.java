package com.campus.maintenance.service;

import com.campus.maintenance.dto.TicketRequest;
import com.campus.maintenance.entity.Ticket;
import com.campus.maintenance.entity.User;
import com.campus.maintenance.repository.TicketRepository;
import com.campus.maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public Ticket createTicket(TicketRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        ticket.setCategory(request.getCategory());
        ticket.setBuilding(request.getBuilding());
        ticket.setLocation(request.getLocation());
        ticket.setStatus("PENDING");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUser(user);

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllOrderByCreatedAtDesc();
    }

    public List<Ticket> getUserTickets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ticketRepository.findByUser_Id(user.getId());
    }

    public List<Ticket> getAssignedTickets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ticketRepository.findByAssignedTo_Id(user.getId());
    }

    public Ticket updateStatus(Long id, String status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
}