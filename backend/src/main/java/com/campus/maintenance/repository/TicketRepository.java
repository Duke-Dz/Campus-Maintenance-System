package com.campus.maintenance.repository;

import com.campus.maintenance.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUser_Id(Long userId);

    List<Ticket> findByAssignedTo_Id(Long maintenanceId);

    List<Ticket> findByStatus(String status);

    @Query("SELECT t FROM Ticket t ORDER BY t.createdAt DESC")
    List<Ticket> findAllOrderByCreatedAtDesc();
}