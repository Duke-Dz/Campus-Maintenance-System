package com.smartcampus.maintenance.config;

import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.TicketLog;
import com.smartcampus.maintenance.entity.TicketRating;
import com.smartcampus.maintenance.entity.Notification;
import com.smartcampus.maintenance.entity.Building;
import com.smartcampus.maintenance.entity.RequestType;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.NotificationType;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TechnicianSpecialty;
import com.smartcampus.maintenance.entity.enums.TicketCategory;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import com.smartcampus.maintenance.repository.BuildingRepository;
import com.smartcampus.maintenance.repository.RequestTypeRepository;
import com.smartcampus.maintenance.repository.TicketLogRepository;
import com.smartcampus.maintenance.repository.TicketRatingRepository;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.repository.NotificationRepository;
import com.smartcampus.maintenance.util.ServiceDomainCatalog;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
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
        BuildingRepository buildingRepository,
        RequestTypeRepository requestTypeRepository,
        TicketRepository ticketRepository,
        TicketLogRepository ticketLogRepository,
        TicketRatingRepository ticketRatingRepository,
        NotificationRepository notificationRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.seed.bootstrap-admin:false}") boolean bootstrapAdmin,
        @Value("${app.seed.demo-data:false}") boolean seedDemoData,
        @Value("${app.seed.admin.username:admin}") String adminUsername,
        @Value("${app.seed.admin.email:admin@campus.local}") String adminEmail,
        @Value("${app.seed.admin.full-name:Campus Admin}") String adminFullName,
        @Value("${app.seed.admin.password:}") String adminPassword,
        @Value("${app.seed.admin.sync-existing:false}") boolean syncExistingAdmin,
        @Value("${app.seed.demo-password:}") String demoPassword
    ) {
        return args -> {
            User admin = null;
            if (bootstrapAdmin) {
                admin = ensureAdminUser(
                    userRepository,
                    passwordEncoder,
                    adminUsername,
                    adminEmail,
                    adminFullName,
                    adminPassword,
                    syncExistingAdmin
                );
            } else {
                admin = userRepository.findByRole(Role.ADMIN).stream().findFirst().orElse(null);
                log.info("Bootstrap admin creation disabled (app.seed.bootstrap-admin=false).");
            }

            if (!seedDemoData) {
                log.info("Demo data seeding disabled (app.seed.demo-data=false).");
                return;
            }

            if (admin == null) {
                log.warn("Skipping demo data seeding because no admin account is available.");
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
            maintenance1.setSpecialties(EnumSet.of(
                    TechnicianSpecialty.PLUMBING,
                    TechnicianSpecialty.ELECTRICAL,
                    TechnicianSpecialty.GENERAL_MAINTENANCE));
            maintenance2.setSpecialties(EnumSet.of(
                    TechnicianSpecialty.NETWORK,
                    TechnicianSpecialty.HVAC,
                    TechnicianSpecialty.CARPENTRY,
                    TechnicianSpecialty.SANITATION));
            maintenance1 = userRepository.save(maintenance1);
            maintenance2 = userRepository.save(maintenance2);

            Building library = ensureBuilding(buildingRepository, "Library", "LIB", 4, 0);
            Building engineeringHall = ensureBuilding(buildingRepository, "Engineering Hall", "ENG", 5, 1);
            Building scienceBlock = ensureBuilding(buildingRepository, "Science Block", "SCI", 4, 2);
            Building studentCenter = ensureBuilding(buildingRepository, "Student Center", "STU", 3, 3);
            Building businessSchool = ensureBuilding(buildingRepository, "Business School", "BUS", 4, 4);
            Building mainHall = ensureBuilding(buildingRepository, "Main Hall", "MHL", 3, 5);
            Building auditorium = ensureBuilding(buildingRepository, "Auditorium", "AUD", 2, 6);
            Building artsBuilding = ensureBuilding(buildingRepository, "Arts Building", "ART", 4, 7);
            Building dormitoryC = ensureBuilding(buildingRepository, "Dormitory C", "DMC", 5, 8);
            Building cafeteria = ensureBuilding(buildingRepository, "Cafeteria", "CAF", 2, 9);

            RequestType electricalType = requireRequestType(requestTypeRepository, TicketCategory.ELECTRICAL);
            RequestType cleaningType = requireRequestType(requestTypeRepository, TicketCategory.CLEANING);
            RequestType itType = requireRequestType(requestTypeRepository, TicketCategory.IT);
            RequestType plumbingType = requireRequestType(requestTypeRepository, TicketCategory.PLUMBING);
            RequestType hvacType = requireRequestType(requestTypeRepository, TicketCategory.HVAC);
            RequestType safetyType = requireRequestType(requestTypeRepository, TicketCategory.SAFETY);
            RequestType furnitureType = requireRequestType(requestTypeRepository, TicketCategory.FURNITURE);
            RequestType structuralType = requireRequestType(requestTypeRepository, TicketCategory.STRUCTURAL);

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
                electricalType,
                library,
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
                cleaningType,
                engineeringHall,
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
                itType,
                scienceBlock,
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
                plumbingType,
                studentCenter,
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
                hvacType,
                businessSchool,
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
                safetyType,
                mainHall,
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
                itType,
                auditorium,
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
                furnitureType,
                artsBuilding,
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
                structuralType,
                dormitoryC,
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
                cleaningType,
                cafeteria,
                "Patio",
                UrgencyLevel.LOW,
                base.plusDays(9).plusHours(4),
                TicketStatus.SUBMITTED
            ));

            addRating(ticketRatingRepository, tickets.get(6), student1, 5, "Resolved quickly and professionally.");
            addRating(ticketRatingRepository, tickets.get(5), student2, 4, "Issue fixed, communication could be better.");
            seedNotification(notificationRepository, admin, "New ticket submitted",
                "Ticket #" + tickets.get(0).getId() + " requires review.", NotificationType.TICKET_UPDATE, "/tickets/" + tickets.get(0).getId());
            seedNotification(notificationRepository, maintenance1, "Ticket assigned",
                "You were assigned ticket #" + tickets.get(3).getId() + ".", NotificationType.ASSIGNMENT, "/tickets/" + tickets.get(3).getId());
            seedNotification(notificationRepository, student1, "Ticket resolved",
                "Your ticket #" + tickets.get(6).getId() + " has been resolved.", NotificationType.TICKET_UPDATE, "/tickets/" + tickets.get(6).getId());
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
        RequestType requestType,
        Building building,
        String location,
        UrgencyLevel urgency,
        LocalDateTime createdAt,
        TicketStatus finalStatus
    ) {
        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setRequestType(requestType);
        ticket.setCategory(ServiceDomainCatalog.legacyCategoryForKey(requestType.getServiceDomain().getKey()));
        ticket.setBuildingRecord(building);
        ticket.setBuilding(building.getName());
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

    private Building ensureBuilding(
        BuildingRepository buildingRepository,
        String name,
        String code,
        int floors,
        int sortOrder
    ) {
        return buildingRepository.findByNameIgnoreCase(name)
            .map(existing -> {
                existing.setCode(code);
                existing.setFloors(floors);
                existing.setActive(true);
                existing.setSortOrder(sortOrder);
                return buildingRepository.save(existing);
            })
            .orElseGet(() -> {
                Building building = new Building();
                building.setName(name);
                building.setCode(code);
                building.setFloors(floors);
                building.setSortOrder(sortOrder);
                return buildingRepository.save(building);
            });
    }

    private RequestType requireRequestType(RequestTypeRepository requestTypeRepository, TicketCategory category) {
        return requestTypeRepository.findFirstByServiceDomain_KeyIgnoreCaseOrderBySortOrderAscIdAsc(category.name())
            .orElseThrow(() -> new IllegalStateException(
                "Seed request type missing for domain '" + category.name() + "'. Run Flyway migrations before startup."));
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

    private void seedNotification(
        NotificationRepository notificationRepository,
        User user,
        String title,
        String message,
        NotificationType type,
        String linkUrl
    ) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLinkUrl(linkUrl);
        notificationRepository.save(notification);
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
        String adminPassword,
        boolean syncExistingAdmin
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

            if (!syncExistingAdmin) {
                log.info("Bootstrap admin sync disabled. Reusing existing admin account '{}'.", targetAdmin.getUsername());
                return targetAdmin;
            }

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
