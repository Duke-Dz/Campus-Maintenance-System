package com.smartcampus.maintenance.event;

public record PendingRegistrationVerificationRequestedEvent(
        String email,
        String fullName,
        String verificationCode,
        long expiresInMinutes) {
}
