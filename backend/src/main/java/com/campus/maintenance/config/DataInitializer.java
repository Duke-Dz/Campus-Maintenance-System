package com.campus.maintenance.config;

import com.campus.maintenance.entity.User;
import com.campus.maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // DEFINE YOUR USERS HERE
        // Format: createAccountIfNotFound("username", "password", Role)
        
        createAccountIfNotFound("admin", "password", User.Role.ADMIN);
        createAccountIfNotFound("student1", "password", User.Role.STUDENT);
        createAccountIfNotFound("maintenance1", "password", User.Role.MAINTENANCE);
        
        // You can add more here whenever you want!
        // createAccountIfNotFound("myNewUser", "mySecretPass", User.Role.STUDENT);
    }

    private void createAccountIfNotFound(String username, String rawPassword, User.Role role) {
        // Only create the user if they don't exist yet
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            userRepository.save(user);
            System.out.println("✅ DataInitializer: Created user '" + username + "'");
        }
    }
}