package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.entity.enums.Role;
import java.util.List;
import java.util.Map;

public final class AccountPreferenceCatalog {

    public record Definition(
            String key,
            String label,
            boolean defaultInAppEnabled,
            boolean defaultEmailEnabled,
            String defaultDeliveryMode) {
    }

    private static final Map<Role, List<Definition>> DEFINITIONS = Map.of(
            Role.STUDENT,
            List.of(
                    new Definition("ticket_update", "Ticket updates", true, false, "instant"),
                    new Definition("resolution", "Resolution updates", true, true, "instant"),
                    new Definition("rating_request", "Rating requests", true, false, "instant"),
                    new Definition("announcement", "Campus broadcasts", true, false, "instant")),
            Role.MAINTENANCE,
            List.of(
                    new Definition("assignment", "Assignments", true, true, "instant"),
                    new Definition("comment_chat", "Comments and chat", true, false, "instant"),
                    new Definition("sla_risk", "SLA risk alerts", true, true, "instant"),
                    new Definition("announcement", "Operational broadcasts", true, false, "instant")),
            Role.ADMIN,
            List.of(
                    new Definition("critical_ticket", "Critical ticket alerts", true, true, "instant"),
                    new Definition("sla_breach", "SLA breach alerts", true, true, "instant"),
                    new Definition("backlog_alert", "Backlog alerts", true, false, "instant"),
                    new Definition("broadcast_status", "Broadcast delivery status", true, true, "instant"),
                    new Definition("invite_acceptance", "Staff invite acceptance", true, true, "instant")));

    private AccountPreferenceCatalog() {
    }

    public static List<Definition> definitionsFor(Role role) {
        return DEFINITIONS.getOrDefault(role, DEFINITIONS.get(Role.STUDENT));
    }

    public static Definition definitionFor(Role role, String key) {
        if (key == null || key.isBlank()) {
            return null;
        }
        return definitionsFor(role).stream()
                .filter(definition -> definition.key().equalsIgnoreCase(key.trim()))
                .findFirst()
                .orElse(null);
    }

    public static boolean supports(Role role, String key) {
        return definitionFor(role, key) != null;
    }
}
