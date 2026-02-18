package com.smartcampus.maintenance.dto.ticket;

public record TicketUserInfoResponse(
    Long id,
    String username,
    String fullName,
    String role
) {
}
