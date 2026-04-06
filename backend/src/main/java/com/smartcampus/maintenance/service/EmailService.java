package com.smartcampus.maintenance.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class EmailService {

    private final EmailOutboxService emailOutboxService;
    private final SpringTemplateEngine templateEngine;
    private final String supportInbox;
    private final String frontendBaseUrl;

    public EmailService(
            EmailOutboxService emailOutboxService,
            SpringTemplateEngine templateEngine,
            @Value("${app.email.support-inbox:${app.email.from:no-reply@campusfix.local}}") String supportInbox,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.emailOutboxService = emailOutboxService;
        this.templateEngine = templateEngine;
        this.supportInbox = supportInbox;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendWelcomeEmail(String fullName, String toEmail, String loginUrl) {
        String text = """
                Hi %s,

                Your CampusFix account is active. Sign in here: %s

                If you did not expect this email, contact support.
                """.formatted(displayName(fullName), loginUrl);
        sendBrandedEmail(
                toEmail,
                "Welcome to CampusFix",
                text,
                "Account ready",
                "Your CampusFix account is now active.",
                "You can start reporting and tracking campus maintenance issues from one secure workspace.",
                null,
                "Sign In",
                loginUrl,
                "If you did not expect this email, contact CampusFix support immediately.");
    }

    public void sendVerificationCodeEmail(String fullName, String toEmail, String verificationCode, long expiresInMinutes) {
        String text = """
                Hi %s,

                Use this verification code to activate your CampusFix account:
                %s

                This code expires in %d minutes.
                """.formatted(displayName(fullName), verificationCode, expiresInMinutes);
        sendBrandedEmail(
                toEmail,
                "CampusFix: Verify Your Email",
                text,
                "Verify account",
                "Finish creating your CampusFix account.",
                "Enter the verification code below in CampusFix to verify your email and finish creating your account.",
                verificationCode,
                null,
                null,
                "This verification code expires in " + expiresInMinutes + " minutes.");
    }

    public void sendMfaCodeEmail(String fullName, String toEmail, String verificationCode, long expiresInMinutes) {
        String text = """
                Hi %s,

                Use this one-time code to complete your CampusFix sign-in:
                %s

                This code expires in %d minutes.
                """.formatted(displayName(fullName), verificationCode, expiresInMinutes);
        sendBrandedEmail(
                toEmail,
                "CampusFix: Your Sign-in Code",
                text,
                "Security check",
                "Confirm your sign-in",
                "Enter this one-time code in CampusFix to complete your sign-in.",
                verificationCode,
                null,
                null,
                "This code expires in " + expiresInMinutes + " minutes. If this wasn't you, reset your password.");
    }

    public void sendStaffInviteEmail(String fullName, String toEmail, String acceptUrl, long expiresInHours) {
        String text = """
                Hi %s,

                You were invited to join CampusFix as maintenance staff.
                Accept invitation: %s

                This invitation expires in %d hour(s).
                """.formatted(displayName(fullName), acceptUrl, expiresInHours);
        sendBrandedEmail(
                toEmail,
                "CampusFix: Staff Invitation",
                text,
                "Maintenance access",
                "You have been invited to CampusFix.",
                "Use the secure button below to choose your username and password, then activate your maintenance account.",
                null,
                "Accept Invitation",
                acceptUrl,
                "This invitation expires in " + expiresInHours + " hour(s).");
    }

    public void sendTicketCreatedEmail(String toEmail, String ticketTitle, Long ticketId) {
        String text = "Your ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has been submitted successfully.";
        sendBrandedEmail(
                toEmail,
                "CampusFix: Ticket Created",
                text,
                "Request received",
                "Your maintenance request has been submitted.",
                "CampusFix recorded your request and the operations team can now review it.",
                "#" + ticketId,
                "Open CampusFix",
                frontendBaseUrl,
                "Keep this ticket ID for future reference: #" + ticketId + ".");
    }

    public void sendTicketAssignedEmail(String toEmail, String ticketTitle, Long ticketId) {
        String text = "You have been assigned to ticket \"" + ticketTitle + "\" (ID: " + ticketId + ").";
        sendBrandedEmail(
                toEmail,
                "CampusFix: New Assignment",
                text,
                "Work assigned",
                "A new work order is waiting for you.",
                "Open CampusFix to review the location, urgency, and attached request details.",
                "#" + ticketId,
                "Open Work Queue",
                frontendBaseUrl,
                "This assignment was generated by CampusFix operations.");
    }

    public void sendTicketResolvedEmail(String toEmail, String ticketTitle, Long ticketId) {
        String text = "Your ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has been resolved. Please review.";
        sendBrandedEmail(
                toEmail,
                "CampusFix: Ticket Resolved",
                text,
                "Request resolved",
                "Your maintenance request has been marked resolved.",
                "Open CampusFix to review the result, follow-up notes, and rating prompt.",
                "#" + ticketId,
                "Review Ticket",
                frontendBaseUrl,
                "If the issue is not fully resolved, reply through CampusFix support.");
    }

    public void sendSlaBreachEmail(String toEmail, String ticketTitle, Long ticketId) {
        String text = "Ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has breached its SLA deadline.";
        sendBrandedEmail(
                toEmail,
                "CampusFix: SLA Breach Alert",
                text,
                "SLA alert",
                "A ticket has breached its response target.",
                "Open CampusFix immediately to review the delay, assign the next action, and recover service time.",
                "#" + ticketId,
                "Open CampusFix",
                frontendBaseUrl,
                "This alert was sent because the ticket exceeded its SLA deadline.");
    }

    public void sendPasswordResetEmail(String fullName, String toEmail, String resetUrl, long expiresInMinutes) {
        String text = """
                Hi %s,

                Reset your CampusFix password using this link:
                %s

                This link expires in %d minutes.
                """.formatted(displayName(fullName), resetUrl, expiresInMinutes);
        sendBrandedEmail(
                toEmail,
                "CampusFix: Password Reset Request",
                text,
                "Password reset",
                "Reset your CampusFix password.",
                "Use the secure link below to choose a new password for your account.",
                null,
                "Reset Password",
                resetUrl,
                "This link expires in " + expiresInMinutes + " minutes. If you did not request this, you can ignore this email.");
    }

    public void sendPasswordChangedEmail(String fullName, String toEmail, String loginUrl) {
        String text = """
                Hi %s,

                Your CampusFix password was changed successfully.
                If this was not you, contact support immediately.

                Sign in: %s
                """.formatted(displayName(fullName), loginUrl);
        sendBrandedEmail(
                toEmail,
                "CampusFix: Password Changed",
                text,
                "Security notice",
                "Your password was changed successfully.",
                "If this was not you, contact support immediately and sign in to review your account activity.",
                null,
                "Sign In",
                loginUrl,
                "For security, keep your password unique and never share it.");
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
        sendPlainEmail(supportInbox, "CampusFix Support Request: " + subject, body);
    }

    private void sendPlainEmail(String to, String subject, String body) {
        emailOutboxService.enqueue(to, subject, body, null);
    }

    private void sendBrandedEmail(
            String to,
            String subject,
            String plainText,
            String eyebrow,
            String heading,
            String intro,
            String highlightValue,
            String buttonLabel,
            String buttonUrl,
            String note) {
        Context context = new Context();
        context.setVariable("subject", subject);
        context.setVariable("preheader", intro);
        context.setVariable("eyebrow", eyebrow);
        context.setVariable("heading", heading);
        context.setVariable("intro", intro);
        context.setVariable("highlightValue", highlightValue);
        context.setVariable("buttonLabel", buttonLabel);
        context.setVariable("buttonUrl", buttonUrl);
        context.setVariable("note", note);
        context.setVariable("footerTitle", "CampusFix Systems");
        context.setVariable("footerCopy", List.of(
                "Smart campus maintenance platform",
                "Secure, transactional service communication"));
        String html = templateEngine.process("email/transaction", context);
        emailOutboxService.enqueue(to, subject, plainText, html);
    }

    private String displayName(String fullName) {
        if (!StringUtils.hasText(fullName)) {
            return "there";
        }
        return fullName.trim();
    }
}
