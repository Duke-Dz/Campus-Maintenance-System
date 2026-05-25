package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import com.smartcampus.maintenance.entity.enums.UrgencyLevel;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class TicketSpecifications {

    private TicketSpecifications() {
    }

    public static Specification<Ticket> statusEquals(TicketStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Ticket> serviceDomainKeyEquals(String serviceDomainKey) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(serviceDomainKey)) {
                return cb.conjunction();
            }
            Join<Object, Object> requestTypeJoin = root.join("requestType", JoinType.LEFT);
            Join<Object, Object> serviceDomainJoin = requestTypeJoin.join("serviceDomain", JoinType.LEFT);
            String normalized = serviceDomainKey.trim().toUpperCase();
            return cb.or(
                    cb.equal(serviceDomainJoin.get("key"), normalized),
                    cb.and(cb.isNull(root.get("requestType")), cb.equal(root.get("category").as(String.class), normalized)));
        };
    }

    public static Specification<Ticket> requestTypeEquals(Long requestTypeId) {
        return (root, query, cb) -> requestTypeId == null
                ? cb.conjunction()
                : cb.equal(root.get("requestType").get("id"), requestTypeId);
    }

    public static Specification<Ticket> buildingEquals(Long buildingId) {
        return (root, query, cb) -> buildingId == null
                ? cb.conjunction()
                : cb.equal(root.get("buildingRecord").get("id"), buildingId);
    }

    public static Specification<Ticket> urgencyEquals(UrgencyLevel urgency) {
        return (root, query, cb) -> urgency == null ? cb.conjunction() : cb.equal(root.get("urgency"), urgency);
    }

    public static Specification<Ticket> assigneeEquals(Long assigneeId) {
        return (root, query, cb) -> assigneeId == null
            ? cb.conjunction()
            : cb.equal(root.get("assignedTo").get("id"), assigneeId);
    }

    public static Specification<Ticket> assignmentReviewRequiredEquals(Boolean assignmentReviewRequired) {
        return (root, query, cb) -> assignmentReviewRequired == null
                ? cb.conjunction()
                : cb.equal(root.get("assignmentReviewRequired"), assignmentReviewRequired);
    }

    public static Specification<Ticket> searchLike(String search) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(search)) {
                return cb.conjunction();
            }
            String pattern = "%" + search.trim().toLowerCase() + "%";
            Join<Object, Object> buildingJoin = root.join("buildingRecord", JoinType.LEFT);
            Join<Object, Object> requestTypeJoin = root.join("requestType", JoinType.LEFT);
            return cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern),
                cb.like(cb.lower(root.get("location")), pattern),
                cb.like(cb.lower(cb.coalesce(buildingJoin.get("name"), root.get("building"))), pattern),
                cb.like(cb.lower(requestTypeJoin.get("label")), pattern)
            );
        };
    }
}
