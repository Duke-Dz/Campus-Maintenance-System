package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.chat.ChatMessageResponse;
import com.smartcampus.maintenance.dto.chat.ChatSendRequest;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.service.ChatService;
import com.smartcampus.maintenance.service.CurrentUserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets/{ticketId}/chat")
public class ChatController {

    private final ChatService chatService;
    private final CurrentUserService currentUserService;

    public ChatController(ChatService chatService, CurrentUserService currentUserService) {
        this.chatService = chatService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<ChatMessageResponse> getMessages(@PathVariable Long ticketId) {
        User actor = currentUserService.requireCurrentUser();
        return chatService.getMessages(ticketId, actor);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessageResponse sendMessage(
            @PathVariable Long ticketId,
            @Valid @RequestBody ChatSendRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return chatService.sendMessage(ticketId, request, actor);
    }
}
