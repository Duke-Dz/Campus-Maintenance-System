package com.smartcampus.maintenance.dto.user;

public record UserWithTicketCountResponse(
    Long id,
    String username,
    String email,
    String fullName,
    String role,
    long ticketCount
) {
}
