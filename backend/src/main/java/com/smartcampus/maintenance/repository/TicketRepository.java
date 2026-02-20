package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.enums.TicketStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    List<Ticket> findByCreatedByIdOrderByCreatedAtDesc(Long createdById);

    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(Long assignedToId);

    long countByCreatedById(Long createdById);

    long countByCreatedByIdAndStatusIn(Long createdById, Collection<TicketStatus> statuses);

    long countByAssignedToId(Long assignedToId);

    @Query("""
                select t.building, count(t)
                from Ticket t
                group by t.building
                order by count(t) desc
            """)
    List<Object[]> countByBuilding();

    @Query("""
                select u.id, u.username, u.fullName, count(t)
                from Ticket t
                join t.assignedTo u
                where t.status in :resolvedStatuses
                group by u.id, u.username, u.fullName
                order by count(t) desc
            """)
    List<Object[]> crewPerformance(@Param("resolvedStatuses") Collection<TicketStatus> resolvedStatuses);

    List<Ticket> findByCategoryAndBuildingAndStatusNotIn(
            com.smartcampus.maintenance.entity.enums.TicketCategory category,
            String building,
            Collection<TicketStatus> statuses);

    long countByAssignedToIdAndStatusIn(Long assignedToId, Collection<TicketStatus> statuses);
}
