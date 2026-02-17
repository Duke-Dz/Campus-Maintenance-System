package com.campus.maintenance.service;

import com.campus.maintenance.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TicketRepository ticketRepository;

    public Map<String, Long> getDashboardStats() {
        long total = ticketRepository.count();
        long pending = ticketRepository.findByStatus("Pending").size();
        long resolved = ticketRepository.findByStatus("Resolved").size();

        return Map.of(
                "totalTickets", total,
                "pendingTickets", pending,
                "resolvedTickets", resolved);
    }
}
