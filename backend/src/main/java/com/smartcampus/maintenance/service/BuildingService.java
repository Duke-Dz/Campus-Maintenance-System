package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.building.BuildingCreateRequest;
import com.smartcampus.maintenance.dto.building.BuildingResponse;
import com.smartcampus.maintenance.entity.Building;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.ConflictException;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.repository.BuildingRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;

    public BuildingService(BuildingRepository buildingRepository) {
        this.buildingRepository = buildingRepository;
    }

    @Transactional(readOnly = true)
    public List<BuildingResponse> getActiveBuildings() {
        return buildingRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BuildingResponse> getAllBuildings(User actor) {
        requireAdmin(actor);
        return buildingRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BuildingResponse createBuilding(User actor, BuildingCreateRequest request) {
        requireAdmin(actor);
        if (buildingRepository.existsByName(request.name())) {
            throw new ConflictException("Building '" + request.name() + "' already exists");
        }
        if (buildingRepository.existsByCode(request.code())) {
            throw new ConflictException("Building code '" + request.code() + "' already exists");
        }
        Building building = new Building();
        building.setName(request.name());
        building.setCode(request.code());
        building.setFloors(request.floors());
        building = buildingRepository.save(building);
        return toResponse(building);
    }

    private BuildingResponse toResponse(Building b) {
        return new BuildingResponse(b.getId(), b.getName(), b.getCode(), b.getFloors(), b.isActive(), b.getCreatedAt());
    }

    private void requireAdmin(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("ADMIN role is required");
        }
    }
}
