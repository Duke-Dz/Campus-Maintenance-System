package com.smartcampus.maintenance.dto.user;

import com.smartcampus.maintenance.entity.enums.TechnicianSpecialty;
import java.time.LocalDateTime;
import java.util.List;

public record StaffInviteResponse(
        Long id,
        String email,
        String fullName,
        LocalDateTime expiresAt,
        List<String> specialties) {
}
