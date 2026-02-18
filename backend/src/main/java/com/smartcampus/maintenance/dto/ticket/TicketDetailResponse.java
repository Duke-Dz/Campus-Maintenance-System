package com.smartcampus.maintenance.dto.ticket;

import java.util.List;

public record TicketDetailResponse(
    TicketResponse ticket,
    List<TicketLogResponse> logs,
    TicketRatingResponse rating
) {
}
