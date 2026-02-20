package com.smartcampus.maintenance.dto.building;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BuildingCreateRequest(
        @NotBlank(message = "Building name is required") @Size(max = 100, message = "Building name must be at most 100 characters") String name,

        @NotBlank(message = "Building code is required") @Size(max = 20, message = "Building code must be at most 20 characters") String code,

        @Min(value = 1, message = "Floors must be at least 1") @Max(value = 100, message = "Floors must be at most 100") int floors) {
}
