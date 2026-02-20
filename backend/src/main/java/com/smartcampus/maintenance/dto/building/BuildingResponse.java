package com.smartcampus.maintenance.dto.building;

import java.time.LocalDateTime;

public record BuildingResponse(
        Long id,
        String name,
        String code,
        int floors,
        boolean active,
        LocalDateTime createdAt) {
}
