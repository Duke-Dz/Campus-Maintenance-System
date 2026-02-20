package com.smartcampus.maintenance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Email service stub. When spring-boot-starter-mail is added to pom.xml
 * and SMTP properties are configured, replace the stub methods with
 * actual JavaMailSender calls.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.email.from:campusfixsystems@gmail.com}")
    private String fromAddress;

    public void sendTicketCreatedEmail(String toEmail, String ticketTitle, Long ticketId) {
        sendEmail(toEmail, "CampusFix: Ticket Created",
                "Your ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has been submitted successfully.");
    }

    public void sendTicketAssignedEmail(String toEmail, String ticketTitle, Long ticketId) {
        sendEmail(toEmail, "CampusFix: New Assignment",
                "You have been assigned to ticket \"" + ticketTitle + "\" (ID: " + ticketId + ").");
    }

    public void sendTicketResolvedEmail(String toEmail, String ticketTitle, Long ticketId) {
        sendEmail(toEmail, "CampusFix: Ticket Resolved",
                "Your ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has been resolved. Please review.");
    }

    public void sendSlaBreachEmail(String toEmail, String ticketTitle, Long ticketId) {
        sendEmail(toEmail, "CampusFix: SLA Breach Alert",
                "Ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has breached its SLA deadline.");
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        sendEmail(toEmail, "CampusFix: Password Reset",
                "Use this token to reset your password: " + resetToken +
                        "\nThis token expires in 1 hour.");
    }

    public void sendSupportRequestEmail(String fullName, String fromEmail, String category, String subject, String message) {
        String body = """
                New support request submitted:
                Full name: %s
                Email: %s
                Category: %s
                Subject: %s

                Message:
                %s
                """.formatted(fullName, fromEmail, category, subject, message);
        sendEmail(fromAddress, "CampusFix Support Request: " + subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            log.info("[EMAIL STUB] To: {}, Subject: {}, Body: {}", to, subject, body);
            return;
        }
        // TODO: Replace with JavaMailSender implementation when SMTP is configured
        // javaMailSender.send(message); ...
        log.info("Email sent to {} with subject: {}", to, subject);
    }
}
