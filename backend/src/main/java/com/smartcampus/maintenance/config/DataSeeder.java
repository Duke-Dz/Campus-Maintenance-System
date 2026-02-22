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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedData(
        UserRepository userRepository,
        TicketRepository ticketRepository,
        TicketLogRepository ticketLogRepository,
        TicketRatingRepository ticketRatingRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.seed.demo-data:true}") boolean seedDemoData,
        @Value("${app.seed.admin.username:admin}") String adminUsername,
        @Value("${app.seed.admin.email:admin@campus.local}") String adminEmail,
        @Value("${app.seed.admin.full-name:Campus Admin}") String adminFullName,
        @Value("${app.seed.admin.password:password}") String adminPassword,
        @Value("${app.seed.demo-password:password}") String demoPassword
    ) {
        return args -> {
            User admin = ensureAdminUser(
                userRepository,
                passwordEncoder,
                adminUsername,
                adminEmail,
                adminFullName,
                adminPassword
            );

            if (!seedDemoData) {
                log.info("Demo data seeding disabled (app.seed.demo-data=false).");
                return;
            }

            if (userRepository.count() > 1 || ticketRepository.count() > 0) {
                return;
            }

            User student1 = createUser(userRepository, passwordEncoder, "student1", "student1@campus.local", "Alex Student", Role.STUDENT, demoPassword);
            User student2 = createUser(userRepository, passwordEncoder, "student2", "student2@campus.local", "Jordan Student", Role.STUDENT, demoPassword);
            User maintenance1 = createUser(
                userRepository,
                passwordEncoder,
                "maintenance1",
                "maintenance1@campus.local",
                "Casey Technician",
                Role.MAINTENANCE,
                demoPassword
            );
            User maintenance2 = createUser(
                userRepository,
                passwordEncoder,
                "maintenance2",
                "maintenance2@campus.local",
                "Taylor Engineer",
                Role.MAINTENANCE,
                demoPassword
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
            log.info("Seeded demo users and tickets.");
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
        Role role,
        String rawPassword
    ) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setEmailVerified(true);
        user.setPasswordHash(encoder.encode(rawPassword));
        return userRepository.save(user);
    }

    private User ensureAdminUser(
        UserRepository userRepository,
        PasswordEncoder encoder,
        String adminUsername,
        String adminEmail,
        String adminFullName,
        String adminPassword
    ) {
        String username = adminUsername.trim();
        String email = adminEmail.trim().toLowerCase();
        String fullName = adminFullName.trim();

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        if (!admins.isEmpty()) {
            User targetAdmin = admins.stream()
                .filter(a -> a.getUsername().equalsIgnoreCase(username))
                .findFirst()
                .orElse(admins.get(0));

            if (admins.size() > 1) {
                log.warn("Multiple admin accounts detected ({}). Syncing configured credentials to admin id {}.", admins.size(), targetAdmin.getId());
            }

            boolean changed = false;

            if (!targetAdmin.getUsername().equals(username)) {
                if (userRepository.existsByUsernameAndIdNot(username, targetAdmin.getId())) {
                    throw new IllegalStateException("Cannot sync admin username. Username '" + username + "' is already used by another user.");
                }
                targetAdmin.setUsername(username);
                changed = true;
            }

            if (!targetAdmin.getEmail().equals(email)) {
                if (userRepository.existsByEmailAndIdNot(email, targetAdmin.getId())) {
                    throw new IllegalStateException("Cannot sync admin email. Email '" + email + "' is already used by another user.");
                }
                targetAdmin.setEmail(email);
                changed = true;
            }

            if (!targetAdmin.getFullName().equals(fullName)) {
                targetAdmin.setFullName(fullName);
                changed = true;
            }

            if (!targetAdmin.isEmailVerified()) {
                targetAdmin.setEmailVerified(true);
                changed = true;
            }

            if (!encoder.matches(adminPassword, targetAdmin.getPasswordHash())) {
                targetAdmin.setPasswordHash(encoder.encode(adminPassword));
                changed = true;
            }

            if (changed) {
                targetAdmin = userRepository.save(targetAdmin);
                log.info("Synchronized bootstrap admin credentials for account '{}'.", targetAdmin.getUsername());
            }

            return targetAdmin;
        }

        if (userRepository.existsByUsername(username)) {
            throw new IllegalStateException("Cannot seed admin user. Username '" + username + "' already exists.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Cannot seed admin user. Email '" + email + "' already exists.");
        }

        User admin = new User();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setFullName(fullName);
        admin.setRole(Role.ADMIN);
        admin.setEmailVerified(true);
        admin.setPasswordHash(encoder.encode(adminPassword));
        admin = userRepository.save(admin);
        log.info("Created bootstrap admin account '{}'", username);
        return admin;
    }
}
