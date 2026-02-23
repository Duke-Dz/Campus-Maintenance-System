package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.user.BroadcastMessageRequest;
import com.smartcampus.maintenance.dto.user.BroadcastMessageResponse;
import com.smartcampus.maintenance.dto.user.StaffInviteRequest;
import com.smartcampus.maintenance.dto.user.StaffInviteResponse;
import com.smartcampus.maintenance.dto.user.UserProfileResponse;
import com.smartcampus.maintenance.dto.user.UserProfileUpdateRequest;
import com.smartcampus.maintenance.dto.user.UserSummaryResponse;
import com.smartcampus.maintenance.dto.user.UserWithTicketCountResponse;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.service.CurrentUserService;
import com.smartcampus.maintenance.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

    @GetMapping("/me")
    public UserProfileResponse getMyProfile() {
        User actor = currentUserService.requireCurrentUser();
        return userService.getMyProfile(actor);
    }

    @PatchMapping("/me")
    public UserProfileResponse updateMyProfile(@Valid @RequestBody UserProfileUpdateRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return userService.updateMyProfile(actor, request);
    }

    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public StaffInviteResponse createStaff(@Valid @RequestBody StaffInviteRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return userService.inviteStaffUser(actor, request);
    }

    @PostMapping("/broadcast")
    public BroadcastMessageResponse broadcastMessage(@Valid @RequestBody BroadcastMessageRequest request) {
        User actor = currentUserService.requireCurrentUser();
        return userService.broadcastMessage(actor, request);
    }
}
