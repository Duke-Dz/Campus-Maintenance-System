package com.smartcampus.maintenance.util;

import com.smartcampus.maintenance.entity.enums.TechnicianSpecialty;
import java.util.EnumSet;
import java.util.Set;

public final class TechnicianSpecialtyCatalog {

    private TechnicianSpecialtyCatalog() {
    }

    public static Set<TechnicianSpecialty> specialtiesForServiceDomainKey(String serviceDomainKey) {
        if (serviceDomainKey == null) {
            return Set.of();
        }
        return switch (serviceDomainKey.trim().toUpperCase()) {
            case "ELECTRICAL" -> EnumSet.of(TechnicianSpecialty.ELECTRICAL);
            case "PLUMBING" -> EnumSet.of(TechnicianSpecialty.PLUMBING);
            case "HVAC" -> EnumSet.of(TechnicianSpecialty.HVAC);
            case "IT" -> EnumSet.of(TechnicianSpecialty.NETWORK);
            case "CLEANING" -> EnumSet.of(TechnicianSpecialty.SANITATION);
            case "FURNITURE", "STRUCTURAL" -> EnumSet.of(TechnicianSpecialty.CARPENTRY);
            case "SAFETY" -> EnumSet.of(TechnicianSpecialty.GENERAL_MAINTENANCE);
            default -> Set.of();
        };
    }
}
