package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.Building;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BuildingRepository extends JpaRepository<Building, Long> {

    List<Building> findByActiveTrueOrderByNameAsc();

    Optional<Building> findByName(String name);

    boolean existsByName(String name);

    boolean existsByCode(String code);
}
