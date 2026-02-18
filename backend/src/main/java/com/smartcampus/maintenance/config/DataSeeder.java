package com.smartcampus.maintenance.config;

import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.TicketLog;
import com.smartcampus.maintenance.entity.TicketRating;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TicketCategory;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import com.smartcampus.maintenance.repository.TicketLogRepository;
import com.smartcampus.maintenance.repository.TicketRatingRepository;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
        UserRepository userRepository,
        TicketRepository ticketRepository,
        TicketLogRepository ticketLogRepository,
        TicketRatingRepository ticketRatingRepository,
        PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            User admin = createUser(userRepository, passwordEncoder, "admin", "admin@campus.local", "Campus Admin", Role.ADMIN);
            User student1 = createUser(userRepository, passwordEncoder, "student1", "student1@campus.local", "Alex Student", Role.STUDENT);
            User student2 = createUser(userRepository, passwordEncoder, "student2", "student2@campus.local", "Jordan Student", Role.STUDENT);
            User maintenance1 = createUser(
                userRepository,
                passwordEncoder,
                "maintenance1",
                "maintenance1@campus.local",
                "Casey Technician",
                Role.MAINTENANCE
            );
            User maintenance2 = createUser(
                userRepository,
                passwordEncoder,
                "maintenance2",
                "maintenance2@campus.local",
                "Taylor Engineer",
                Role.MAINTENANCE
            );

            List<Ticket> tickets = new ArrayList<>();
            LocalDateTime base = LocalDateTime.now().minusDays(14);

            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student1,
                null,
                admin,
                null,
                "Broken study room light",
                "Lights flicker and turn off in Study Room 204.",
                TicketCategory.ELECTRICAL,
                "Library",
                "Room 204",
                UrgencyLevel.MEDIUM,
                base.plusHours(2),
                TicketStatus.SUBMITTED
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student2,
                null,
                admin,
                null,
                "Graffiti on wall",
                "Hallway wall has graffiti near main entrance.",
                TicketCategory.CLEANING,
                "Engineering Hall",
                "North Entrance",
                UrgencyLevel.LOW,
                base.plusHours(5),
                TicketStatus.REJECTED
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student1,
                null,
                admin,
                null,
                "Wi-Fi dead zone",
                "No Wi-Fi signal in the basement classroom.",
                TicketCategory.IT,
                "Science Block",
                "Basement Room B12",
                UrgencyLevel.HIGH,
                base.plusHours(9),
                TicketStatus.APPROVED
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student2,
                maintenance1,
                admin,
                null,
                "Water leak in restroom",
                "Continuous leak from sink pipe in restroom.",
                TicketCategory.PLUMBING,
                "Student Center",
                "Restroom 1F",
                UrgencyLevel.HIGH,
                base.plusDays(1).plusHours(3),
                TicketStatus.ASSIGNED
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student1,
                maintenance2,
                admin,
                maintenance2,
                "AC not cooling",
                "Air conditioning is running but classrooms remain hot.",
                TicketCategory.HVAC,
                "Business School",
                "Classroom 3A",
                UrgencyLevel.CRITICAL,
                base.plusDays(2).plusHours(1),
                TicketStatus.IN_PROGRESS
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student2,
                maintenance1,
                admin,
                maintenance1,
                "Loose handrail",
                "Handrail near stairway feels unstable.",
                TicketCategory.SAFETY,
                "Main Hall",
                "Stairwell East",
                UrgencyLevel.CRITICAL,
                base.plusDays(3).plusHours(4),
                TicketStatus.RESOLVED
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student1,
                maintenance2,
                admin,
                maintenance2,
                "Projector not turning on",
                "Lecture hall projector does not start.",
                TicketCategory.IT,
                "Auditorium",
                "Hall A",
                UrgencyLevel.MEDIUM,
                base.plusDays(5).plusHours(2),
                TicketStatus.CLOSED
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student1,
                maintenance1,
                admin,
                null,
                "Broken desk leg",
                "Desk in classroom has a cracked support leg.",
                TicketCategory.FURNITURE,
                "Arts Building",
                "Room 116",
                UrgencyLevel.MEDIUM,
                base.plusDays(6).plusHours(5),
                TicketStatus.ASSIGNED
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student2,
                maintenance2,
                admin,
                maintenance2,
                "Cracked ceiling tile",
                "Ceiling tile cracked and partially hanging.",
                TicketCategory.STRUCTURAL,
                "Dormitory C",
                "3rd Floor Corridor",
                UrgencyLevel.HIGH,
                base.plusDays(8).plusHours(2),
                TicketStatus.RESOLVED
            ));
            tickets.add(seedTicket(
                ticketRepository,
                ticketLogRepository,
                student2,
                null,
                admin,
                null,
                "Overflowing trash bins",
                "Outdoor bins near cafeteria are overflowing.",
                TicketCategory.CLEANING,
                "Cafeteria",
                "Patio",
                UrgencyLevel.LOW,
                base.plusDays(9).plusHours(4),
                TicketStatus.SUBMITTED
            ));

            addRating(ticketRatingRepository, tickets.get(6), student1, 5, "Resolved quickly and professionally.");
            addRating(ticketRatingRepository, tickets.get(5), student2, 4, "Issue fixed, communication could be better.");
        };
    }

    @Transactional
    protected Ticket seedTicket(
        TicketRepository ticketRepository,
        TicketLogRepository ticketLogRepository,
        User createdBy,
        User assignedTo,
        User adminActor,
        User maintenanceActor,
        String title,
        String description,
        TicketCategory category,
        String building,
        String location,
        UrgencyLevel urgency,
        LocalDateTime createdAt,
        TicketStatus finalStatus
    ) {
        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setBuilding(building);
        ticket.setLocation(location);
        ticket.setUrgency(urgency);
        ticket.setCreatedBy(createdBy);
        ticket.setCreatedAt(createdAt);
        ticket.setUpdatedAt(createdAt);
        ticket.setStatus(TicketStatus.SUBMITTED);

        if (assignedTo != null) {
            ticket.setAssignedTo(assignedTo);
        }

        ticket = ticketRepository.save(ticket);
        addLog(ticketLogRepository, ticket, null, TicketStatus.SUBMITTED, createdBy, "Ticket submitted");

        if (finalStatus == TicketStatus.SUBMITTED) {
            return ticket;
        }

        if (finalStatus == TicketStatus.REJECTED) {
            ticket.setStatus(TicketStatus.REJECTED);
            ticket.setUpdatedAt(ticket.getCreatedAt().plusHours(2));
            ticket = ticketRepository.save(ticket);
            addLog(ticketLogRepository, ticket, TicketStatus.SUBMITTED, TicketStatus.REJECTED, adminActor, "Ticket rejected");
            return ticket;
        }

        transition(ticketRepository, ticketLogRepository, ticket, TicketStatus.APPROVED, adminActor, "Ticket approved");
        if (finalStatus == TicketStatus.APPROVED) {
            return ticket;
        }

        transition(ticketRepository, ticketLogRepository, ticket, TicketStatus.ASSIGNED, adminActor, "Ticket assigned to crew");
        if (finalStatus == TicketStatus.ASSIGNED) {
            return ticket;
        }

        User maintActor = maintenanceActor != null ? maintenanceActor : assignedTo;
        transition(ticketRepository, ticketLogRepository, ticket, TicketStatus.IN_PROGRESS, maintActor, "Work started");
        if (finalStatus == TicketStatus.IN_PROGRESS) {
            return ticket;
        }

        ticket.setResolvedAt(ticket.getCreatedAt().plusHours(18));
        transition(ticketRepository, ticketLogRepository, ticket, TicketStatus.RESOLVED, maintActor, "Issue resolved");
        if (finalStatus == TicketStatus.RESOLVED) {
            return ticket;
        }

        transition(ticketRepository, ticketLogRepository, ticket, TicketStatus.CLOSED, adminActor, "Ticket closed by admin");
        return ticket;
    }

    private void transition(
        TicketRepository ticketRepository,
        TicketLogRepository ticketLogRepository,
        Ticket ticket,
        TicketStatus target,
        User actor,
        String note
    ) {
        TicketStatus old = ticket.getStatus();
        ticket.setStatus(target);
        ticket.setUpdatedAt(ticket.getUpdatedAt().plusHours(1));
        ticketRepository.save(ticket);
        addLog(ticketLogRepository, ticket, old, target, actor, note);
    }

    private void addLog(
        TicketLogRepository ticketLogRepository,
        Ticket ticket,
        TicketStatus oldStatus,
        TicketStatus newStatus,
        User actor,
        String note
    ) {
        TicketLog log = new TicketLog();
        log.setTicket(ticket);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setChangedBy(actor);
        log.setNote(note);
        ticketLogRepository.save(log);
    }

    private void addRating(TicketRatingRepository ticketRatingRepository, Ticket ticket, User ratedBy, int stars, String comment) {
        TicketRating rating = new TicketRating();
        rating.setTicket(ticket);
        rating.setRatedBy(ratedBy);
        rating.setStars(stars);
        rating.setComment(comment);
        ticketRatingRepository.save(rating);
    }

    private User createUser(
        UserRepository userRepository,
        PasswordEncoder encoder,
        String username,
        String email,
        String fullName,
        Role role
    ) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setPasswordHash(encoder.encode("password"));
        return userRepository.save(user);
    }
}
