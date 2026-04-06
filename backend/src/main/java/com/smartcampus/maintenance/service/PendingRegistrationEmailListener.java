package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.event.PendingRegistrationVerificationRequestedEvent;
import com.smartcampus.maintenance.event.PendingRegistrationVerifiedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PendingRegistrationEmailListener {

    private static final Logger log = LoggerFactory.getLogger(PendingRegistrationEmailListener.class);

    private final EmailService emailService;

    public PendingRegistrationEmailListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPendingRegistrationVerificationRequested(PendingRegistrationVerificationRequestedEvent event) {
        try {
            emailService.sendVerificationCodeEmail(
                    event.fullName(),
                    event.email(),
                    event.verificationCode(),
                    event.expiresInMinutes());
        } catch (RuntimeException ex) {
            log.error("Unable to queue verification email for {}", event.email(), ex);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPendingRegistrationVerified(PendingRegistrationVerifiedEvent event) {
        try {
            emailService.sendWelcomeEmail(event.fullName(), event.email(), event.loginUrl());
        } catch (RuntimeException ex) {
            log.error("Unable to queue welcome email for {}", event.email(), ex);
        }
    }
}
