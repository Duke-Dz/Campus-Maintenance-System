package com.smartcampus.maintenance.repository;

import com.smartcampus.maintenance.entity.ChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
