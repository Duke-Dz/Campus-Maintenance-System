package com.smartcampus.maintenance.dto.user;

import java.util.List;

public record UserWithTicketCountResponse(
    Long id,
    String username,
    String email,
    String fullName,
    String role,
    long ticketCount,
    List<String> specialties
) {
}
