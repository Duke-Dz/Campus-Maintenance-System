package com.campus.maintenance.controller;

import com.campus.maintenance.dto.UserDtos;
import com.campus.maintenance.entity.User;
import com.campus.maintenance.service.AdminService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDtos.UserView>> users() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserDtos.UserView> updateRole(@PathVariable Long id, @RequestParam User.Role role) {
        return ResponseEntity.ok(adminService.updateRole(id, role));
    }

    @PatchMapping("/users/{id}/active")
    public ResponseEntity<UserDtos.UserView> setActive(@PathVariable Long id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(adminService.setActive(id, enabled));
    }
}
