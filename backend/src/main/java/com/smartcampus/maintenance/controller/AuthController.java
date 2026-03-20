package com.smartcampus.maintenance.controller;

import com.smartcampus.maintenance.dto.auth.AcceptStaffInviteRequest;
import com.smartcampus.maintenance.dto.auth.AuthResponse;
import com.smartcampus.maintenance.dto.auth.CurrentUserResponse;
import com.smartcampus.maintenance.dto.auth.ForgotPasswordRequest;
import com.smartcampus.maintenance.dto.auth.LoginRequest;
import com.smartcampus.maintenance.dto.auth.ResendVerificationRequest;
import com.smartcampus.maintenance.dto.auth.RegisterRequest;
import com.smartcampus.maintenance.dto.auth.ResetPasswordRequest;
import com.smartcampus.maintenance.dto.auth.UsernameSuggestionsResponse;
import com.smartcampus.maintenance.dto.auth.VerifyEmailRequest;
import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.service.AuthService;
import com.smartcampus.maintenance.service.CurrentUserService;
import com.smartcampus.maintenance.service.PublicEndpointSecurityService;
import com.smartcampus.maintenance.service.RefreshCookieService;
import com.smartcampus.maintenance.service.RequestMetadata;
import com.smartcampus.maintenance.service.RequestMetadataResolver;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;
    private final RequestMetadataResolver requestMetadataResolver;
    private final PublicEndpointSecurityService publicEndpointSecurityService;
    private final RefreshCookieService refreshCookieService;

    public AuthController(
            AuthService authService,
            CurrentUserService currentUserService,
            RequestMetadataResolver requestMetadataResolver,
            PublicEndpointSecurityService publicEndpointSecurityService,
            RefreshCookieService refreshCookieService) {
        this.authService = authService;
        this.currentUserService = currentUserService;
        this.requestMetadataResolver = requestMetadataResolver;
        this.publicEndpointSecurityService = publicEndpointSecurityService;
        this.refreshCookieService = refreshCookieService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        RequestMetadata metadata = requestMetadataResolver.resolve(servletRequest);
        publicEndpointSecurityService.guardLogin(request.username(), request.captchaToken(), metadata);
        HttpHeaders headers = new HttpHeaders();
        AuthResponse response = authService.login(request, metadata, headers);
        return ResponseEntity.ok().headers(headers).body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest servletRequest) {
        RequestMetadata metadata = requestMetadataResolver.resolve(servletRequest);
        HttpHeaders headers = new HttpHeaders();
        AuthResponse response = authService.refreshSession(readRefreshToken(servletRequest), metadata, headers);
        return ResponseEntity.ok().headers(headers).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest servletRequest) {
        RequestMetadata metadata = requestMetadataResolver.resolve(servletRequest);
        HttpHeaders headers = new HttpHeaders();
        authService.logout(readRefreshToken(servletRequest), metadata, headers);
        return ResponseEntity.ok().headers(headers).body(Map.of("message", "Signed out successfully."));
    }

    @GetMapping("/me")
    public CurrentUserResponse me() {
        User actor = currentUserService.requireCurrentUser();
        return authService.currentUser(actor);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        RequestMetadata metadata = requestMetadataResolver.resolve(servletRequest);
        publicEndpointSecurityService.guardRegistration(request.email(), request.captchaToken(), metadata);
        authService.registerStudent(request, metadata);
        return Map.of("message", "If the details are eligible, check your email for a verification link.");
    }

    @PostMapping("/verify-email")
    public Map<String, String> verifyEmail(@Valid @RequestBody VerifyEmailRequest request, HttpServletRequest servletRequest) {
        authService.verifyEmail(request.token(), requestMetadataResolver.resolve(servletRequest));
        return Map.of("message", "Email verified successfully. You can now sign in.");
    }

    @PostMapping("/resend-verification")
    public Map<String, String> resendVerification(@Valid @RequestBody ResendVerificationRequest request,
            HttpServletRequest servletRequest) {
        RequestMetadata metadata = requestMetadataResolver.resolve(servletRequest);
        publicEndpointSecurityService.guardResendVerification(request.email(), request.captchaToken(), metadata);
        authService.resendVerificationCode(request.email(), metadata);
        return Map.of("message", "If a pending registration exists, a new verification link has been sent.");
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {
        RequestMetadata metadata = requestMetadataResolver.resolve(servletRequest);
        publicEndpointSecurityService.guardForgotPassword(request.email(), request.captchaToken(), metadata);
        authService.forgotPassword(request.email(), metadata);
        return Map.of("message", "If an account exists with this email, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest) {
        authService.resetPassword(request.token(), request.newPassword(), requestMetadataResolver.resolve(servletRequest));
        return Map.of("message", "Password has been reset successfully.");
    }

    @PostMapping("/accept-staff-invite")
    public Map<String, String> acceptStaffInvite(@Valid @RequestBody AcceptStaffInviteRequest request,
            HttpServletRequest servletRequest) {
        authService.acceptStaffInvite(request, requestMetadataResolver.resolve(servletRequest));
        return Map.of("message", "Invite accepted successfully. You can now sign in.");
    }

    @GetMapping("/username-suggestions")
    public UsernameSuggestionsResponse getUsernameSuggestions(
            @RequestParam("username") @NotBlank String username,
            @RequestParam(value = "fullName", required = false) String fullName) {
        List<String> suggestions = authService.getUsernameSuggestions(username, fullName);
        return new UsernameSuggestionsResponse(username, suggestions);
    }

    private String readRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (refreshCookieService.cookieName().equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
