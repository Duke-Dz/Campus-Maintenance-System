package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.repository.TicketRepository;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final String CSV_HEADER = "ID,Title,Category,Building,Location,Urgency,Status,Created By,Assigned To,Created At,Resolved At";

    private final TicketRepository ticketRepository;

    public ReportService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public byte[] exportTicketsCsv(User actor) {
        requireAdmin(actor);
        List<Ticket> tickets = ticketRepository.findAll();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8));
        writer.println(CSV_HEADER);

        for (Ticket t : tickets) {
            writer.println(String.join(",",
                    String.valueOf(t.getId()),
                    escape(t.getTitle()),
                    t.getCategory().name(),
                    escape(t.getBuilding()),
                    escape(t.getLocation()),
                    t.getUrgency().name(),
                    t.getStatus().name(),
                    escape(t.getCreatedBy().getFullName()),
                    t.getAssignedTo() != null ? escape(t.getAssignedTo().getFullName()) : "",
                    t.getCreatedAt() != null ? t.getCreatedAt().format(FORMATTER) : "",
                    t.getResolvedAt() != null ? t.getResolvedAt().format(FORMATTER) : ""));
        }

        writer.flush();
        return out.toByteArray();
    }

    private String escape(String value) {
        if (value == null)
            return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }
}
