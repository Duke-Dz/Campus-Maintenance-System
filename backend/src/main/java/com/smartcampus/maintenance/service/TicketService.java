package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.ticket.CommentCreateRequest;
import com.smartcampus.maintenance.dto.ticket.CommentResponse;
import com.smartcampus.maintenance.dto.ticket.DuplicateCheckResponse;
import com.smartcampus.maintenance.dto.ticket.DuplicateCheckResponse.SimilarTicketSummary;
import com.smartcampus.maintenance.dto.ticket.TicketAssignRequest;
import com.smartcampus.maintenance.dto.ticket.TicketAssignmentResponseRequest;
import com.smartcampus.maintenance.dto.ticket.TicketAssignmentRecommendationResponse;
import com.smartcampus.maintenance.dto.ticket.TicketCreateRequest;
import com.smartcampus.maintenance.dto.ticket.TicketDetailResponse;
import com.smartcampus.maintenance.dto.ticket.TicketLogResponse;
import com.smartcampus.maintenance.dto.ticket.TicketRateRequest;
import com.smartcampus.maintenance.dto.ticket.TicketRatingResponse;
import com.smartcampus.maintenance.dto.ticket.TicketResponse;
import com.smartcampus.maintenance.dto.ticket.TicketStatusUpdateRequest;
import com.smartcampus.maintenance.entity.Building;
import com.smartcampus.maintenance.entity.RequestType;
import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.TicketComment;
import com.smartcampus.maintenance.entity.TicketLog;
import com.smartcampus.maintenance.entity.TicketRating;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.NotificationType;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TicketCategory;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import com.smartcampus.maintenance.exception.ConflictException;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.exception.NotFoundException;
import com.smartcampus.maintenance.exception.UnprocessableEntityException;
import com.smartcampus.maintenance.mapper.TicketMapper;
import com.smartcampus.maintenance.repository.TicketCommentRepository;
import com.smartcampus.maintenance.repository.TicketLogRepository;
import com.smartcampus.maintenance.repository.TicketRatingRepository;
import com.smartcampus.maintenance.repository.TicketRepository;
import com.smartcampus.maintenance.repository.TicketSpecifications;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.service.TicketAttachmentAccessService.AttachmentType;
import com.smartcampus.maintenance.util.ServiceDomainCatalog;
import com.smartcampus.maintenance.util.FileStorageService;
import com.smartcampus.maintenance.util.FileStorageService.StoredFile;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TicketService {

    private static final EnumSet<TicketStatus> RESOLVED_OR_CLOSED = EnumSet.of(TicketStatus.RESOLVED,
            TicketStatus.CLOSED);
    private static final int MAX_AUTO_ASSIGN_ACTIVE_TICKETS = 4;

    private final TicketRepository ticketRepository;
    private final TicketLogRepository ticketLogRepository;
    private final TicketRatingRepository ticketRatingRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;
    private final BuildingService buildingService;
    private final CatalogService catalogService;
    private final AutoAssignmentService autoAssignmentService;
    private final FileStorageService fileStorageService;
    private final TicketAttachmentAccessService ticketAttachmentAccessService;
    private final NotificationDispatchService notificationDispatchService;
    private final EmailService emailService;

    public TicketService(
            TicketRepository ticketRepository,
            TicketLogRepository ticketLogRepository,
            TicketRatingRepository ticketRatingRepository,
            TicketCommentRepository ticketCommentRepository,
            UserRepository userRepository,
            BuildingService buildingService,
            CatalogService catalogService,
            AutoAssignmentService autoAssignmentService,
            FileStorageService fileStorageService,
            TicketAttachmentAccessService ticketAttachmentAccessService,
            NotificationDispatchService notificationDispatchService,
            EmailService emailService) {
        this.ticketRepository = ticketRepository;
        this.ticketLogRepository = ticketLogRepository;
        this.ticketRatingRepository = ticketRatingRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.userRepository = userRepository;
        this.buildingService = buildingService;
        this.catalogService = catalogService;
        this.autoAssignmentService = autoAssignmentService;
        this.fileStorageService = fileStorageService;
        this.ticketAttachmentAccessService = ticketAttachmentAccessService;
        this.notificationDispatchService = notificationDispatchService;
        this.emailService = emailService;
    }

    @Transactional
    public TicketResponse createTicket(User actor, TicketCreateRequest request, MultipartFile imageFile) {
        requireRole(actor, Role.STUDENT);
        Building building = buildingService.requireActiveBuilding(request.buildingId());
        RequestType requestType = catalogService.requireActiveRequestType(request.requestTypeId());
        String serviceDomainKey = requestType.getServiceDomain().getKey();

        Ticket ticket = new Ticket();
        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description().trim());
        ticket.setRequestType(requestType);
        ticket.setCategory(ServiceDomainCatalog.legacyCategoryForKey(serviceDomainKey));
        ticket.setBuildingRecord(building);
        ticket.setBuilding(building.getName());
        ticket.setLocation(request.location().trim());
        ticket.setUrgency(request.urgency());
        ticket.setStatus(TicketStatus.SUBMITTED);
        ticket.setCreatedBy(actor);
        ticket.setImagePath(fileStorageService.store(imageFile));

        Ticket saved = ticketRepository.save(ticket);
        addLog(saved, null, TicketStatus.SUBMITTED, actor, "Ticket submitted");

        boolean autoAssigned = tryAutoAssign(saved, actor);
        if (!autoAssigned) {
            TicketStatus previous = saved.getStatus();
            saved.setStatus(TicketStatus.APPROVED);
            saved = ticketRepository.save(saved);
            addLog(saved, previous, TicketStatus.APPROVED, actor,
                    "Auto-assignment unavailable. Ticket requires admin validation.");
            notifyAdmins(
                    "Ticket #" + saved.getId() + " requires admin validation",
                    "No available crew capacity for \"" + saved.getTitle() + "\". Please validate and assign manually.",
                    NotificationType.ASSIGNMENT,
                    ticketLink(saved));
        }

        notifyAdmins(
                "New ticket #" + saved.getId(),
                actor.getFullName() + " submitted \"" + saved.getTitle() + "\".",
                NotificationType.TICKET_UPDATE,
                ticketLink(saved));
        emailService.sendTicketCreatedEmail(actor.getEmail(), saved.getTitle(), saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public TicketResponse respondToAssignment(Long ticketId, TicketAssignmentResponseRequest request, User actor) {
        requireRole(actor, Role.MAINTENANCE);
        Ticket ticket = requireTicket(ticketId);
        if (ticket.getAssignedTo() == null || !Objects.equals(ticket.getAssignedTo().getId(), actor.getId())) {
            throw new ForbiddenException("Maintenance users can only respond to their own assignments");
        }
        if (ticket.getStatus() != TicketStatus.ASSIGNED) {
            throw new ConflictException("Only ASSIGNED tickets can be accepted or declined");
        }

        if (Boolean.TRUE.equals(request.accepted())) {
            ticket.setStatus(TicketStatus.ACCEPTED);
            Ticket saved = ticketRepository.save(ticket);
            addLog(saved, TicketStatus.ASSIGNED, TicketStatus.ACCEPTED, actor,
                    safeNote(request.note(), "Assignment accepted by maintenance"));
            notifyTicketStakeholders(
                    saved,
                    actor,
                    "Ticket #" + saved.getId() + " accepted",
                    "Maintenance accepted \"" + saved.getTitle() + "\" and will begin work shortly.");
            return toResponse(saved);
        }

        if (!StringUtils.hasText(request.note())) {
            throw new UnprocessableEntityException("Please include a reason when declining an assignment");
        }

        ticket.setAssignedTo(null);
        ticket.setStatus(TicketStatus.APPROVED);
        Ticket saved = ticketRepository.save(ticket);
        addLog(saved, TicketStatus.ASSIGNED, TicketStatus.APPROVED, actor,
                "Assignment declined by maintenance: " + request.note().trim());
        notifyAdmins(
                "Ticket #" + saved.getId() + " requires reassignment",
                actor.getFullName() + " declined assignment for \"" + saved.getTitle() + "\". Please review and reassign.",
                NotificationType.ASSIGNMENT,
                ticketLink(saved));
        notifyTicketStakeholders(
                saved,
                actor,
                "Ticket #" + saved.getId() + " reassignment in progress",
                "Maintenance requested reassignment for \"" + saved.getTitle() + "\". Admin review is in progress.");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets(
            User actor,
            TicketStatus status,
            String serviceDomainKey,
            Long requestTypeId,
            Long buildingId,
            UrgencyLevel urgency,
            Long assigneeId,
            String search) {
        requireRole(actor, Role.ADMIN);
        Specification<Ticket> specification = Specification.allOf(
                TicketSpecifications.statusEquals(status),
                TicketSpecifications.serviceDomainKeyEquals(serviceDomainKey),
                TicketSpecifications.requestTypeEquals(requestTypeId),
                TicketSpecifications.buildingEquals(buildingId),
                TicketSpecifications.urgencyEquals(urgency),
                TicketSpecifications.assigneeEquals(assigneeId),
                TicketSpecifications.searchLike(search));
        return ticketRepository.findAll(specification, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(User actor) {
        requireRole(actor, Role.STUDENT);
        return ticketRepository.findByCreatedByIdOrderByCreatedAtDesc(actor.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAssignedTickets(User actor) {
        requireRole(actor, Role.MAINTENANCE);
        return ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(actor.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketDetailResponse getTicketDetail(Long ticketId, User actor) {
        Ticket ticket = requireTicket(ticketId);
        ensureAccess(ticket, actor);

        List<TicketLogResponse> logs = ticketLogRepository.findByTicketIdOrderByTimestampAsc(ticketId).stream()
                .map(TicketMapper::toLogResponse)
                .toList();
        TicketRatingResponse rating = ticketRatingRepository.findByTicketId(ticketId)
                .map(TicketMapper::toRatingResponse)
                .orElse(null);
        return new TicketDetailResponse(toResponse(ticket), logs, rating);
    }

    @Transactional(readOnly = true)
    public List<TicketAssignmentRecommendationResponse> getAssignmentRecommendations(Long ticketId, User actor) {
        requireRole(actor, Role.ADMIN);
        Ticket ticket = requireTicket(ticketId);
        if (ticket.getStatus() != TicketStatus.APPROVED) {
            throw new ConflictException("Ticket must be APPROVED before recommendations are available");
        }
        return autoAssignmentService.recommendAssignees(ticket, 3);
    }

    @Transactional(readOnly = true)
    public List<TicketLogResponse> getLogs(Long ticketId, User actor) {
        Ticket ticket = requireTicket(ticketId);
        ensureAccess(ticket, actor);
        return ticketLogRepository.findByTicketIdOrderByTimestampAsc(ticketId).stream()
                .map(TicketMapper::toLogResponse)
                .toList();
    }

    @Transactional
    public TicketResponse assignTicket(Long ticketId, TicketAssignRequest request, User actor) {
        requireRole(actor, Role.ADMIN);
        Ticket ticket = requireTicket(ticketId);
        if (ticket.getStatus() != TicketStatus.APPROVED) {
            throw new ConflictException("Ticket must be APPROVED before assignment");
        }

        User assignee = userRepository.findById(request.assigneeId())
                .orElseThrow(() -> new NotFoundException("Maintenance user not found"));
        if (assignee.getRole() != Role.MAINTENANCE) {
            throw new UnprocessableEntityException("Assignee must have MAINTENANCE role");
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setAssignedTo(assignee);
        ticket.setStatus(TicketStatus.ASSIGNED);
        Ticket saved = ticketRepository.save(ticket);
        addLog(saved, oldStatus, TicketStatus.ASSIGNED, actor, safeNote(request.note(), "Ticket assigned"));
        notificationDispatchService.notifyUser(
                assignee,
                "Ticket #" + saved.getId() + " assigned",
                "You were assigned \"" + saved.getTitle() + "\".",
                NotificationType.ASSIGNMENT,
                ticketLink(saved));
        notificationDispatchService.notifyUser(
                saved.getCreatedBy(),
                "Ticket #" + saved.getId() + " assigned",
                "Your ticket \"" + saved.getTitle() + "\" is now assigned to maintenance.",
                NotificationType.TICKET_UPDATE,
                ticketLink(saved));
        emailService.sendTicketAssignedEmail(assignee.getEmail(), saved.getTitle(), saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, TicketStatusUpdateRequest request, User actor) {
        Ticket ticket = requireTicket(ticketId);
        ensureCanUpdateStatus(ticket, request, actor);

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus targetStatus = request.status();
        if (oldStatus == targetStatus) {
            throw new ConflictException("Ticket is already in status " + targetStatus.name());
        }

        ticket.setStatus(targetStatus);
        if (oldStatus == TicketStatus.ASSIGNED && targetStatus == TicketStatus.APPROVED
                && actor.getRole() == Role.MAINTENANCE) {
            ticket.setAssignedTo(null);
        }
        if (targetStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (oldStatus == TicketStatus.RESOLVED && targetStatus != TicketStatus.CLOSED) {
            ticket.setResolvedAt(null);
        }

        Ticket saved = ticketRepository.save(ticket);
        addLog(saved, oldStatus, targetStatus, actor, request.note());

        String statusLabel = targetStatus.name().replace('_', ' ').toLowerCase();
        String message = "Ticket \"" + saved.getTitle() + "\" moved to " + statusLabel + ".";
        notifyTicketStakeholders(saved, actor, "Ticket #" + saved.getId() + " status updated", message);

        if (targetStatus == TicketStatus.RESOLVED) {
            emailService.sendTicketResolvedEmail(saved.getCreatedBy().getEmail(), saved.getTitle(), saved.getId());
        }
        return toResponse(saved);
    }

    @Transactional
    public TicketRatingResponse rateTicket(Long ticketId, TicketRateRequest request, User actor) {
        requireRole(actor, Role.STUDENT);
        Ticket ticket = requireTicket(ticketId);
        if (!Objects.equals(ticket.getCreatedBy().getId(), actor.getId())) {
            throw new ForbiddenException("Students can only rate their own tickets");
        }
        if (!RESOLVED_OR_CLOSED.contains(ticket.getStatus())) {
            throw new ConflictException("Only RESOLVED or CLOSED tickets can be rated");
        }
        if (ticketRatingRepository.existsByTicketId(ticketId)) {
            throw new ConflictException("Ticket has already been rated");
        }

        TicketRating rating = new TicketRating();
        rating.setTicket(ticket);
        rating.setRatedBy(actor);
        rating.setStars(request.stars());
        rating.setComment(request.comment() == null ? null : request.comment().trim());
        TicketRating saved = ticketRatingRepository.save(rating);
        return TicketMapper.toRatingResponse(saved);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> downloadAttachment(
            Long ticketId,
            String attachmentType,
            Long expiresAt,
            String signature) {
        Ticket ticket = requireTicket(ticketId);
        AttachmentType type = AttachmentType.fromPathSegment(attachmentType);
        String storedPath = type == AttachmentType.BEFORE ? ticket.getImagePath() : ticket.getAfterImagePath();
        if (!StringUtils.hasText(signature) || expiresAt == null) {
            throw new ForbiddenException("Attachment access is invalid or has expired.");
        }
        if (!StringUtils.hasText(storedPath)) {
            throw new NotFoundException("Attachment not found");
        }
        ticketAttachmentAccessService.validate(ticket, type, storedPath, expiresAt, signature);

        StoredFile storedFile = fileStorageService.load(storedPath);
        MediaType mediaType = MediaType.parseMediaType(storedFile.contentType());
        Resource resource = new FileSystemResource(storedFile.path());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.noStore())
                .body(resource);
    }

    private void ensureCanUpdateStatus(Ticket ticket, TicketStatusUpdateRequest request, User actor) {
        TicketStatus current = ticket.getStatus();
        TicketStatus target = request.status();
        boolean override = Boolean.TRUE.equals(request.override());

        if (actor.getRole() == Role.ADMIN) {
            if (override) {
                return;
            }
            boolean allowed = (current == TicketStatus.SUBMITTED
                    && (target == TicketStatus.APPROVED || target == TicketStatus.REJECTED))
                    || (current == TicketStatus.APPROVED && target == TicketStatus.ASSIGNED)
                    || (current == TicketStatus.ACCEPTED && target == TicketStatus.IN_PROGRESS)
                    || (current == TicketStatus.RESOLVED && target == TicketStatus.CLOSED);

            if (!allowed) {
                throw new ConflictException("Invalid admin transition from " + current + " to " + target);
            }
            if (target == TicketStatus.ASSIGNED && ticket.getAssignedTo() == null) {
                throw new UnprocessableEntityException("Ticket must have an assignee before moving to ASSIGNED");
            }
            return;
        }

        if (actor.getRole() == Role.MAINTENANCE) {
            if (ticket.getAssignedTo() == null || !Objects.equals(ticket.getAssignedTo().getId(), actor.getId())) {
                throw new ForbiddenException("Maintenance users can only update assigned tickets");
            }
            boolean allowed = (current == TicketStatus.ASSIGNED && target == TicketStatus.ACCEPTED)
                    || (current == TicketStatus.ASSIGNED && target == TicketStatus.APPROVED)
                    || (current == TicketStatus.ACCEPTED && target == TicketStatus.IN_PROGRESS)
                    || (current == TicketStatus.IN_PROGRESS && target == TicketStatus.RESOLVED);
            if (!allowed) {
                throw new ConflictException("Invalid maintenance transition from " + current + " to " + target);
            }
            if (target == TicketStatus.APPROVED && !StringUtils.hasText(request.note())) {
                throw new UnprocessableEntityException("A decline reason is required to return assignment for admin review");
            }
            if (target == TicketStatus.RESOLVED && !StringUtils.hasText(request.note())) {
                throw new UnprocessableEntityException("A work note is required when resolving a ticket");
            }
            return;
        }

        throw new ForbiddenException("Only ADMIN or MAINTENANCE can update ticket status");
    }

    private Ticket requireTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NotFoundException("Ticket not found"));
    }

    private void ensureAccess(Ticket ticket, User actor) {
        if (actor.getRole() == Role.ADMIN) {
            return;
        }
        if (actor.getRole() == Role.STUDENT && Objects.equals(ticket.getCreatedBy().getId(), actor.getId())) {
            return;
        }
        if (actor.getRole() == Role.MAINTENANCE && ticket.getAssignedTo() != null
                && Objects.equals(ticket.getAssignedTo().getId(), actor.getId())) {
            return;
        }
        throw new ForbiddenException("You do not have access to this ticket");
    }

    private void requireRole(User actor, Role required) {
        if (actor.getRole() != required) {
            throw new ForbiddenException("Role " + required + " is required");
        }
    }

    private void addLog(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus, User changedBy, String note) {
        TicketLog log = new TicketLog();
        log.setTicket(ticket);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setChangedBy(changedBy);
        log.setNote(safeNote(note, null));
        ticketLogRepository.save(log);
    }

    private String safeNote(String note, String fallback) {
        if (StringUtils.hasText(note)) {
            return note.trim();
        }
        return fallback;
    }

    // ---- Comments ----

    @Transactional
    public CommentResponse addComment(Long ticketId, CommentCreateRequest request, User actor) {
        Ticket ticket = requireTicket(ticketId);
        ensureAccess(ticket, actor);

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(actor);
        comment.setContent(request.content().trim());
        comment = ticketCommentRepository.save(comment);
        notifyTicketStakeholders(
                ticket,
                actor,
                "New comment on ticket #" + ticket.getId(),
                actor.getFullName() + " added a comment on \"" + ticket.getTitle() + "\".",
                NotificationType.COMMENT);
        return toCommentResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long ticketId, User actor) {
        Ticket ticket = requireTicket(ticketId);
        ensureAccess(ticket, actor);
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::toCommentResponse)
                .toList();
    }

    private CommentResponse toCommentResponse(TicketComment c) {
        return new CommentResponse(
                c.getId(),
                c.getTicket().getId(),
                c.getAuthor().getUsername(),
                c.getAuthor().getFullName(),
                c.getAuthor().getRole().name(),
                c.getContent(),
                c.getCreatedAt());
    }

    // ---- Duplicate Detection ----

    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkDuplicates(TicketCreateRequest request) {
        EnumSet<TicketStatus> closedStatuses = EnumSet.of(TicketStatus.CLOSED, TicketStatus.REJECTED);
        RequestType requestType = catalogService.requireActiveRequestType(request.requestTypeId());
        Building building = buildingService.requireActiveBuilding(request.buildingId());
        List<Ticket> candidates = ticketRepository.findByRequestTypeIdAndBuildingRecordIdAndStatusNotIn(
                requestType.getId(), building.getId(), closedStatuses);

        String inputTitle = request.title().trim().toLowerCase();
        List<SimilarTicketSummary> similar = candidates.stream()
                .filter(t -> similarity(inputTitle, t.getTitle().toLowerCase()) > 0.5)
                .limit(5)
                .map(t -> new SimilarTicketSummary(
                        t.getId(), t.getTitle(), t.getStatus().name(),
                        resolveBuildingName(t), TicketMapper.resolveServiceDomainKey(t)))
                .toList();

        if (similar.isEmpty()) {
            return new DuplicateCheckResponse(false, List.of(), "No similar reports found.");
        }
        return new DuplicateCheckResponse(true, similar,
                "Found " + similar.size() + " similar report(s) in " + building.getName() + ". You may still submit.");
    }

    private double similarity(String a, String b) {
        if (a.equals(b))
            return 1.0;
        if (a.isEmpty() || b.isEmpty())
            return 0.0;
        // containment check
        if (a.contains(b) || b.contains(a))
            return 0.8;
        // Levenshtein distance
        int maxLen = Math.max(a.length(), b.length());
        int distance = levenshtein(a, b);
        return 1.0 - ((double) distance / maxLen);
    }

    private int levenshtein(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++)
            dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++)
            dp[0][j] = j;
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
            }
        }
        return dp[a.length()][b.length()];
    }

    // ---- After-Photo ----

    @Transactional
    public TicketResponse uploadAfterPhoto(Long ticketId, MultipartFile image, User actor) {
        requireRole(actor, Role.MAINTENANCE);
        Ticket ticket = requireTicket(ticketId);
        if (ticket.getAssignedTo() == null || !Objects.equals(ticket.getAssignedTo().getId(), actor.getId())) {
            throw new ForbiddenException("Only the assigned crew member can upload after photos");
        }
        if (ticket.getStatus() != TicketStatus.IN_PROGRESS && ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new ConflictException("Ticket must be IN_PROGRESS or RESOLVED to upload after photo");
        }
        String path = fileStorageService.store(image);
        ticket.setAfterImagePath(path);
        Ticket saved = ticketRepository.save(ticket);
        notifyTicketStakeholders(
                saved,
                actor,
                "After photo uploaded for ticket #" + saved.getId(),
                "After-repair photo is now available for \"" + saved.getTitle() + "\".",
                NotificationType.TICKET_UPDATE);
        return toResponse(saved);
    }

    private void notifyAdmins(String title, String message, NotificationType type, String linkUrl) {
        notificationDispatchService.notifyUsers(userRepository.findByRole(Role.ADMIN), title, message, type, linkUrl);
    }

    private boolean tryAutoAssign(Ticket ticket, User actor) {
        return autoAssignmentService.findBestAssigneeWithinCapacity(ticket, MAX_AUTO_ASSIGN_ACTIVE_TICKETS)
                .map(assignee -> {
                    TicketStatus oldStatus = ticket.getStatus();
                    ticket.setAssignedTo(assignee);
                    ticket.setStatus(TicketStatus.ASSIGNED);
                    Ticket saved = ticketRepository.save(ticket);
                    addLog(saved, oldStatus, TicketStatus.ASSIGNED, actor, "Auto-assigned by system");
                    notificationDispatchService.notifyUser(
                            assignee,
                            "Ticket #" + saved.getId() + " assigned",
                            "New ticket \"" + saved.getTitle() + "\" was auto-assigned. Accept or decline from your queue.",
                            NotificationType.ASSIGNMENT,
                            ticketLink(saved));
                    notificationDispatchService.notifyUser(
                            saved.getCreatedBy(),
                            "Ticket #" + saved.getId() + " assigned",
                            "Your ticket \"" + saved.getTitle() + "\" was assigned to maintenance automatically.",
                            NotificationType.TICKET_UPDATE,
                            ticketLink(saved));
                    return true;
                })
                .orElse(false);
    }

    private void notifyTicketStakeholders(Ticket ticket, User actor, String title, String message) {
        notifyTicketStakeholders(ticket, actor, title, message, NotificationType.TICKET_UPDATE);
    }

    private void notifyTicketStakeholders(
            Ticket ticket,
            User actor,
            String title,
            String message,
            NotificationType type) {
        List<User> recipients = new ArrayList<>();
        recipients.add(ticket.getCreatedBy());
        recipients.add(ticket.getAssignedTo());
        recipients.addAll(userRepository.findByRole(Role.ADMIN));

        Long actorId = actor == null ? null : actor.getId();
        Set<Long> seen = new HashSet<>();
        recipients.stream()
                .filter(user -> user != null && user.getId() != null)
                .filter(user -> actorId == null || !Objects.equals(user.getId(), actorId))
                .filter(user -> seen.add(user.getId()))
                .forEach(user -> notificationDispatchService.notifyUser(user, title, message, type, ticketLink(ticket)));
    }

    private String ticketLink(Ticket ticket) {
        return "/tickets/" + ticket.getId();
    }

    private TicketResponse toResponse(Ticket ticket) {
        return TicketMapper.toResponse(
                ticket,
                ticketAttachmentAccessService.buildSignedUrl(ticket, AttachmentType.BEFORE, ticket.getImagePath()),
                ticketAttachmentAccessService.buildSignedUrl(ticket, AttachmentType.AFTER, ticket.getAfterImagePath()));
    }

    private String resolveBuildingName(Ticket ticket) {
        if (ticket.getBuildingRecord() != null) {
            return ticket.getBuildingRecord().getName();
        }
        return ticket.getBuilding();
    }
}
