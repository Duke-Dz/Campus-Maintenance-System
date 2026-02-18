package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.enums.TicketCategory;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class TicketSpecifications {

    private TicketSpecifications() {
    }

    public static Specification<Ticket> statusEquals(TicketStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Ticket> categoryEquals(TicketCategory category) {
        return (root, query, cb) -> category == null ? cb.conjunction() : cb.equal(root.get("category"), category);
    }

    public static Specification<Ticket> urgencyEquals(UrgencyLevel urgency) {
        return (root, query, cb) -> urgency == null ? cb.conjunction() : cb.equal(root.get("urgency"), urgency);
    }

    public static Specification<Ticket> assigneeEquals(Long assigneeId) {
        return (root, query, cb) -> assigneeId == null
            ? cb.conjunction()
            : cb.equal(root.get("assignedTo").get("id"), assigneeId);
    }

    public static Specification<Ticket> searchLike(String search) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(search)) {
                return cb.conjunction();
            }
            String pattern = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern),
                cb.like(cb.lower(root.get("building")), pattern),
                cb.like(cb.lower(root.get("location")), pattern)
            );
        };
    }
}
