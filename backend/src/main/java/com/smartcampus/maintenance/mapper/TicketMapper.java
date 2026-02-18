package com.smartcampus.maintenance.mapper;

import com.smartcampus.maintenance.dto.ticket.TicketLogResponse;
import com.smartcampus.maintenance.dto.ticket.TicketRatingResponse;
import com.smartcampus.maintenance.dto.ticket.TicketResponse;
import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.TicketLog;
import com.smartcampus.maintenance.entity.TicketRating;

public final class TicketMapper {

    private TicketMapper() {
    }

    public static TicketResponse toResponse(Ticket ticket) {
        return new TicketResponse(
            ticket.getId(),
            ticket.getTitle(),
            ticket.getDescription(),
            ticket.getCategory().name(),
            ticket.getBuilding(),
            ticket.getLocation(),
            ticket.getUrgency().name(),
            ticket.getStatus().name(),
            UserMapper.toTicketUserInfo(ticket.getCreatedBy()),
            UserMapper.toTicketUserInfo(ticket.getAssignedTo()),
            ticket.getImagePath(),
            ticket.getCreatedAt(),
            ticket.getUpdatedAt(),
            ticket.getResolvedAt()
        );
    }

    public static TicketLogResponse toLogResponse(TicketLog log) {
        return new TicketLogResponse(
            log.getId(),
            log.getOldStatus() == null ? null : log.getOldStatus().name(),
            log.getNewStatus().name(),
            log.getNote(),
            UserMapper.toTicketUserInfo(log.getChangedBy()),
            log.getTimestamp()
        );
    }

    public static TicketRatingResponse toRatingResponse(TicketRating rating) {
        if (rating == null) {
            return null;
        }
        return new TicketRatingResponse(
            rating.getStars(),
            rating.getComment(),
            UserMapper.toTicketUserInfo(rating.getRatedBy()),
            rating.getCreatedAt()
        );
    }
}
