package com.smartcampus.maintenance.dto.user;

import com.smartcampus.maintenance.entity.enums.TechnicianSpecialty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record StaffInviteRequest(
        @NotBlank(message = "Email is required") @Email(message = "Email is invalid") String email,

        @NotBlank(message = "Full name is required") @Size(max = 120, message = "Full name must be at most 120 characters") String fullName,

        @NotEmpty(message = "At least one specialty is required for maintenance staff") Set<TechnicianSpecialty> specialties) {
}
