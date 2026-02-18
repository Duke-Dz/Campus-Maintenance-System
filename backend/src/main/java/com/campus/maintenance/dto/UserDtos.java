package com.campus.maintenance.dto;

import com.campus.maintenance.entity.User;
import java.time.LocalDateTime;

public class UserDtos {
    public record UserView(Long id, String name, String username, String email, User.Role role, boolean active, LocalDateTime createdAt) {}
}
