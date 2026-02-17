package com.campus.maintenance.controller;

import com.campus.maintenance.dto.AuthRequest;
import com.campus.maintenance.dto.AuthResponse;
import com.campus.maintenance.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody AuthRequest request) {
        AuthService.AuthResult result = authService.register(request);
        return new AuthResponse(result.getToken(), result.getRole());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        AuthService.AuthResult result = authService.login(request);
        return new AuthResponse(result.getToken(), result.getRole());
    }
}
