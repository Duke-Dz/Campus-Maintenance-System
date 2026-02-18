package com.campus.maintenance.config;

import com.campus.maintenance.entity.User;
import com.campus.maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAccountIfNotFound("admin", "password", "System Admin", "admin@campusfix.local", User.Role.ADMIN);
        createAccountIfNotFound("student1", "password", "Student One", "student1@campusfix.local", User.Role.STUDENT);
        createAccountIfNotFound("maintenance1", "password", "Maintenance One", "maintenance1@campusfix.local", User.Role.MAINTENANCE);
    }

    private void createAccountIfNotFound(String username, String rawPassword, String name, String email, User.Role role) {
        userRepository.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setName(name);
            user.setEmail(email);
            user.setRole(role);
            user.setActive(true);
            return userRepository.save(user);
        });
    }
}
