package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.TicketRating;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRatingRepository extends JpaRepository<TicketRating, Long> {

    boolean existsByTicketId(Long ticketId);

    Optional<TicketRating> findByTicketId(Long ticketId);
}
