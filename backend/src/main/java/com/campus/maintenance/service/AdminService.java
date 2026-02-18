package com.campus.maintenance.service;

import com.campus.maintenance.dto.UserDtos;
import com.campus.maintenance.entity.User;
import com.campus.maintenance.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AdminService {
    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDtos.UserView> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toView)
                .toList();
    }

    public UserDtos.UserView updateRole(Long id, User.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(role);
        return toView(userRepository.save(user));
    }

    public UserDtos.UserView setActive(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(active);
        return toView(userRepository.save(user));
    }

    private UserDtos.UserView toView(User u) {
        return new UserDtos.UserView(u.getId(), u.getName(), u.getUsername(), u.getEmail(), u.getRole(), u.isActive(), u.getCreatedAt());
    }
}
