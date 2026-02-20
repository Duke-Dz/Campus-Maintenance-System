package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.user.CreateStaffRequest;
import com.smartcampus.maintenance.dto.user.UserSummaryResponse;
import com.smartcampus.maintenance.dto.user.UserWithTicketCountResponse;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.service.CurrentUserService;
import com.smartcampus.maintenance.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    public UserController(UserService userService, CurrentUserService currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<UserWithTicketCountResponse> getUsers() {
        User actor = currentUserService.requireCurrentUser();
        return userService.getAllUsersWithTicketCount(actor);
    }

    @GetMapping("/maintenance")
    public List<UserSummaryResponse> getMaintenanceUsers() {
        User actor = currentUserService.requireCurrentUser();
        return userService.getMaintenanceUsers(actor);
    }

    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummaryResponse createStaff(@Valid @RequestBody CreateStaffRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return userService.createStaffUser(actor, request);
    }
}
