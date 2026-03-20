package com.smartcampus.maintenance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.smartcampus.maintenance.entity.PendingRegistration;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.repository.PendingRegistrationRepository;
import com.smartcampus.maintenance.repository.UserRepository;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "app.email.enabled=true")
@AutoConfigureMockMvc
class AuthControllerRegistrationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerDuplicateVerifiedEmailReturnsGenericSuccessWithoutCreatingPendingRegistration() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "existing_" + suffix + "@example.com";
        User existing = new User();
        existing.setUsername("existing_" + suffix);
        existing.setEmail(email);
        existing.setFullName("Existing User");
        existing.setRole(Role.STUDENT);
        existing.setEmailVerified(true);
        existing.setPasswordHash(passwordEncoder.encode("StrongPass#123"));
        userRepository.save(existing);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "fresh_%s",
                                  "email": "%s",
                                  "fullName": "Fresh User",
                                  "password": "StrongPass#123",
                                  "captchaToken": ""
                                }
                                """.formatted(suffix, email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message")
                        .value("If the details are eligible, check your email for a verification link."));

        assertThat(pendingRegistrationRepository.findByEmailIgnoreCase(email)).isEmpty();
    }

    @Test
    void registerCreatesPendingRegistrationInsteadOfUser() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "pending_http_" + suffix + "@example.com";
        String username = "pending_http_" + suffix;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "email": "%s",
                                  "fullName": "Pending Http",
                                  "password": "StrongPass#123",
                                  "captchaToken": ""
                                }
                                """.formatted(username, email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message")
                        .value("If the details are eligible, check your email for a verification link."));

        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertThat(pending.getUsername()).isEqualTo(username);
        assertThat(userRepository.findByEmail(email)).isEmpty();
    }
}
