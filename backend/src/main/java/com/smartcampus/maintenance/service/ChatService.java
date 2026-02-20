package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.dto.chat.ChatMessageResponse;
import com.smartcampus.maintenance.dto.chat.ChatSendRequest;
import com.smartcampus.maintenance.entity.ChatMessage;
import com.smartcampus.maintenance.entity.Ticket;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.exception.ForbiddenException;
import com.smartcampus.maintenance.exception.NotFoundException;
import com.smartcampus.maintenance.repository.ChatMessageRepository;
import com.smartcampus.maintenance.repository.TicketRepository;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final TicketRepository ticketRepository;

    public ChatService(ChatMessageRepository chatMessageRepository, TicketRepository ticketRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long ticketId, ChatSendRequest request, User actor) {
        Ticket ticket = requireTicket(ticketId);
        ensureAccess(ticket, actor);

        ChatMessage message = new ChatMessage();
        message.setTicket(ticket);
        message.setSender(actor);
        message.setContent(request.content().trim());
        message = chatMessageRepository.save(message);
        return toResponse(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long ticketId, User actor) {
        Ticket ticket = requireTicket(ticketId);
        ensureAccess(ticket, actor);
        return chatMessageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::toResponse)
                .toList();
    }

    private void ensureAccess(Ticket ticket, User actor) {
        if (actor.getRole() == Role.ADMIN)
            return;
        if (actor.getRole() == Role.STUDENT && Objects.equals(ticket.getCreatedBy().getId(), actor.getId()))
            return;
        if (actor.getRole() == Role.MAINTENANCE && ticket.getAssignedTo() != null
                && Objects.equals(ticket.getAssignedTo().getId(), actor.getId()))
            return;
        throw new ForbiddenException("You do not have access to this ticket's chat");
    }

    private Ticket requireTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NotFoundException("Ticket not found"));
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        return new ChatMessageResponse(
                m.getId(), m.getTicket().getId(),
                m.getSender().getUsername(), m.getSender().getFullName(),
                m.getSender().getRole().name(), m.getContent(), m.getCreatedAt());
    }
}
