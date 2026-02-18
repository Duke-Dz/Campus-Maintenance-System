package com.campus.maintenance.service;

import com.campus.maintenance.dto.AuthDtos;
import com.campus.maintenance.entity.User;
import com.campus.maintenance.model.PasswordResetCode;
import com.campus.maintenance.repository.PasswordResetCodeRepository;
import com.campus.maintenance.repository.UserRepository;
import com.campus.maintenance.security.JwtService;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Random;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetCodeRepository resetCodeRepository;
    private final MailService mailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       PasswordResetCodeRepository resetCodeRepository,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.resetCodeRepository = resetCodeRepository;
        this.mailService = mailService;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByUsername(request.username().trim())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));

        User.Role requestedRole = Objects.requireNonNullElse(request.role(), User.Role.STUDENT);
        user.setRole(requestedRole == User.Role.ADMIN ? User.Role.STUDENT : requestedRole);

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getUsername(), saved.getRole().name());
        return new AuthDtos.AuthResponse(token, saved.getRole().name(), saved.getUsername(), saved.getEmail());
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is disabled. Contact support.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        return new AuthDtos.AuthResponse(token, user.getRole().name(), user.getUsername(), user.getEmail());
    }

    public void sendResetCode(AuthDtos.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Email is not registered"));

        resetCodeRepository.deleteByEmailOrExpiresAtBefore(user.getEmail(), LocalDateTime.now());

        PasswordResetCode code = new PasswordResetCode();
        code.setEmail(user.getEmail());
        code.setCode(String.format("%06d", new Random().nextInt(1_000_000)));
        code.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        resetCodeRepository.save(code);

        mailService.sendResetCode(user.getEmail(), code.getCode());
    }

    public void resetPassword(AuthDtos.ResetPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        PasswordResetCode resetCode = resetCodeRepository
                .findTopByEmailAndCodeAndUsedFalseOrderByIdDesc(email, request.code())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset code"));

        if (resetCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset code expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email is not registered"));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetCode.setUsed(true);
        resetCodeRepository.save(resetCode);
    }
}
