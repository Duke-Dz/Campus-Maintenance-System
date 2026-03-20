package com.smartcampus.maintenance.event;

public record PendingRegistrationVerifiedEvent(
        String email,
        String fullName,
        String loginUrl) {
}
