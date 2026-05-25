package com.smartcampus.maintenance.mapper;

import com.smartcampus.maintenance.dto.ticket.TicketLogResponse;
import com.smartcampus.maintenance.dto.ticket.TicketRatingResponse;
import com.smartcampus.maintenance.dto.ticket.TicketBuildingResponse;
import com.smartcampus.maintenance.dto.ticket.TicketRequestTypeResponse;
import com.smartcampus.maintenance.dto.ticket.TicketResponse;
import com.smartcampus.maintenance.entity.Building;
import com.smartcampus.maintenance.entity.RequestType;
import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.TicketLog;
import com.smartcampus.maintenance.entity.TicketRating;

public final class TicketMapper {

    private TicketMapper() {
    }

    public static TicketResponse toResponse(Ticket ticket, String imageUrl, String afterImageUrl) {
        String serviceDomainKey = resolveServiceDomainKey(ticket);
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                serviceDomainKey,
                serviceDomainKey,
                ticket.isAssignmentReviewRequired(),
                ticket.getAssignmentReviewReason() == null ? null : ticket.getAssignmentReviewReason().name(),
                toRequestTypeResponse(ticket.getRequestType()),
                toBuildingResponse(ticket.getBuildingRecord(), ticket.getBuilding()),
                ticket.getLocation(),
                ticket.getUrgency().name(),
                ticket.getStatus().name(),
                UserMapper.toTicketUserInfo(ticket.getCreatedBy()),
                UserMapper.toTicketUserInfo(ticket.getAssignedTo()),
                imageUrl,
                afterImageUrl,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getResolvedAt());
    }

    public static String resolveServiceDomainKey(Ticket ticket) {
        if (ticket.getRequestType() != null && ticket.getRequestType().getServiceDomain() != null) {
            return ticket.getRequestType().getServiceDomain().getKey();
        }
        if (ticket.getCategory() != null) {
            return ticket.getCategory().name();
        }
        return "OTHER";
    }

    private static TicketRequestTypeResponse toRequestTypeResponse(RequestType requestType) {
        if (requestType == null) {
            return null;
        }
        return new TicketRequestTypeResponse(requestType.getId(), requestType.getLabel());
    }

    private static TicketBuildingResponse toBuildingResponse(Building building, String legacyBuildingName) {
        if (building != null) {
            return new TicketBuildingResponse(building.getId(), building.getName(), building.getCode());
        }
        return new TicketBuildingResponse(null, legacyBuildingName, null);
    }

    public static TicketLogResponse toLogResponse(TicketLog log) {
        return new TicketLogResponse(
                log.getId(),
                log.getOldStatus() == null ? null : log.getOldStatus().name(),
                log.getNewStatus().name(),
                log.getNote(),
                UserMapper.toTicketUserInfo(log.getChangedBy()),
                log.getTimestamp());
    }

    public static TicketRatingResponse toRatingResponse(TicketRating rating) {
        if (rating == null) {
            return null;
        }
        return new TicketRatingResponse(
                rating.getStars(),
                rating.getComment(),
                UserMapper.toTicketUserInfo(rating.getRatedBy()),
                rating.getCreatedAt());
    }
}
