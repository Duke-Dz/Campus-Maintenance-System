package com.campus.maintenance.controller;

import com.campus.maintenance.dto.AuthDtos;
import com.campus.maintenance.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDtos.AuthResponse> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthDtos.ApiMessage> forgotPassword(@Valid @RequestBody AuthDtos.ForgotPasswordRequest request) {
        authService.sendResetCode(request);
        return ResponseEntity.ok(new AuthDtos.ApiMessage("Reset code sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthDtos.ApiMessage> resetPassword(@Valid @RequestBody AuthDtos.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new AuthDtos.ApiMessage("Password reset successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDtos.ApiMessage> me(Authentication authentication) {
        return ResponseEntity.ok(new AuthDtos.ApiMessage(authentication.getName()));
    }
}
