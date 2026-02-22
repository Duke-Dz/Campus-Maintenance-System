package com.smartcampus.maintenance.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender javaMailSender;
    private final boolean emailEnabled;
    private final String fromAddress;
    private final String supportInbox;
    private final String frontendBaseUrl;
    private static final String LOGO_CID = "campusfixLogo";

    public EmailService(
            @Autowired(required = false) JavaMailSender javaMailSender,
            @Value("${app.email.enabled:false}") boolean emailEnabled,
            @Value("${app.email.from:campusfixsystems@gmail.com}") String fromAddress,
            @Value("${app.email.support-inbox:${app.email.from:campusfixsystems@gmail.com}}") String supportInbox,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.javaMailSender = javaMailSender;
        this.emailEnabled = emailEnabled;
        this.fromAddress = fromAddress;
        this.supportInbox = supportInbox;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendWelcomeEmail(String fullName, String toEmail, String loginUrl) {
        String html = buildBrandedHtml(
                "Welcome to CampusFix",
                "Your account is ready",
                """
                Your CampusFix account is active. You can now report and track maintenance issues in real time.
                """,
                null,
                "Sign In",
                loginUrl,
                "If you did not expect this email, contact CampusFix support.");
        String text = """
                Hi %s,

                Your CampusFix account is active. Sign in here: %s

                If you did not expect this email, contact support.
                """.formatted(displayName(fullName), loginUrl);
        sendHtmlEmail(toEmail, "Welcome to CampusFix", text, html);
    }

    public void sendVerificationCodeEmail(String fullName, String toEmail, String verificationCode, long expiresInMinutes,
            String verifyUrl) {
        String html = buildBrandedHtml(
                "Verify your CampusFix account",
                "Use this verification code",
                "Enter the code below to finish creating your account.",
                verificationCode,
                "Open Verification Page",
                verifyUrl,
                "This code expires in " + expiresInMinutes + " minutes.");

        String text = """
                Hi %s,

                Use this verification code to activate your CampusFix account: %s

                This code expires in %d minutes.
                Verification page: %s
                """.formatted(displayName(fullName), verificationCode, expiresInMinutes, verifyUrl);

        sendHtmlEmail(toEmail, "CampusFix: Verify Your Email", text, html);
    }

    public void sendTicketCreatedEmail(String toEmail, String ticketTitle, Long ticketId) {
        sendPlainEmail(toEmail, "CampusFix: Ticket Created",
                "Your ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has been submitted successfully.");
    }

    public void sendTicketAssignedEmail(String toEmail, String ticketTitle, Long ticketId) {
        sendPlainEmail(toEmail, "CampusFix: New Assignment",
                "You have been assigned to ticket \"" + ticketTitle + "\" (ID: " + ticketId + ").");
    }

    public void sendTicketResolvedEmail(String toEmail, String ticketTitle, Long ticketId) {
        sendPlainEmail(toEmail, "CampusFix: Ticket Resolved",
                "Your ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has been resolved. Please review.");
    }

    public void sendSlaBreachEmail(String toEmail, String ticketTitle, Long ticketId) {
        sendPlainEmail(toEmail, "CampusFix: SLA Breach Alert",
                "Ticket \"" + ticketTitle + "\" (ID: " + ticketId + ") has breached its SLA deadline.");
    }

    public void sendPasswordResetEmail(String fullName, String toEmail, String resetUrl, long expiresInMinutes) {
        String html = buildBrandedHtml(
                "Reset your CampusFix password",
                "Password reset requested",
                "Use the secure link below to set a new password.",
                null,
                "Reset Password",
                resetUrl,
                "This link expires in " + expiresInMinutes + " minutes. If you did not request this, you can ignore this email.");

        String text = """
                Hi %s,

                Reset your CampusFix password using this link:
                %s

                This link expires in %d minutes.
                """.formatted(displayName(fullName), resetUrl, expiresInMinutes);

        sendHtmlEmail(toEmail, "CampusFix: Password Reset Request", text, html);
    }

    public void sendPasswordChangedEmail(String fullName, String toEmail, String loginUrl) {
        String html = buildBrandedHtml(
                "Your password was changed",
                "Password updated successfully",
                "Your CampusFix password has been changed. If this was not you, contact support immediately.",
                null,
                "Sign In",
                loginUrl,
                "For security, always keep your password private and unique.");

        String text = """
                Hi %s,

                Your CampusFix password was changed successfully.
                If this was not you, contact support immediately.

                Sign in: %s
                """.formatted(displayName(fullName), loginUrl);

        sendHtmlEmail(toEmail, "CampusFix: Password Changed", text, html);
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
        if (!emailEnabled) {
            log.info("[EMAIL STUB] To: {}, Subject: {}, Body: {}", to, subject, body);
            return;
        }
        if (!canSend(to, subject)) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            javaMailSender.send(message);
            log.info("Email sent to {} with subject '{}'", to, subject);
        } catch (MailException ex) {
            log.error("Failed to send email to {} with subject '{}': {}", to, subject, ex.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String plainText, String html) {
        if (!emailEnabled) {
            log.info("[EMAIL STUB] To: {}, Subject: {}, Body: {}", to, subject, plainText);
            return;
        }
        if (!canSend(to, subject)) {
            return;
        }

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(plainText, html);
            ClassPathResource logo = new ClassPathResource("email-assets/campusfix-logo.png");
            if (logo.exists()) {
                helper.addInline(LOGO_CID, logo, "image/png");
            }
            javaMailSender.send(message);
            log.info("Email sent to {} with subject '{}'", to, subject);
        } catch (MailException | MessagingException ex) {
            log.error("Failed to send email to {} with subject '{}': {}", to, subject, ex.getMessage());
        }
    }

    private boolean canSend(String to, String subject) {
        if (!StringUtils.hasText(fromAddress)) {
            log.warn("Skipping email send because from address is blank. Subject: {}", subject);
            return false;
        }
        if (!StringUtils.hasText(to)) {
            log.warn("Skipping email send because recipient address is blank. Subject: {}", subject);
            return false;
        }
        if (javaMailSender == null) {
            log.warn("Skipping email send because JavaMailSender is not configured. Subject: {}", subject);
            return false;
        }
        return true;
    }

    private String buildBrandedHtml(
            String title,
            String heading,
            String intro,
            String code,
            String buttonLabel,
            String buttonUrl,
            String note) {
        String safeTitle = htmlEscape(title);
        String safeHeading = htmlEscape(heading);
        String safeIntro = htmlEscape(intro);
        String safeCode = code == null ? "" : htmlEscape(code);
        String safeButtonLabel = buttonLabel == null ? "" : htmlEscape(buttonLabel);
        String safeButtonUrl = buttonUrl == null ? frontendBaseUrl : htmlEscape(buttonUrl);
        String safeNote = note == null ? "" : htmlEscape(note);

        String codeBlock = StringUtils.hasText(code)
                ? "<div style=\"margin:20px 0;text-align:center;\"><span style=\"display:inline-block;padding:12px 22px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;font-size:28px;font-weight:700;letter-spacing:6px;color:#1D4ED8;\">"
                        + safeCode + "</span></div>"
                : "";

        String ctaBlock = StringUtils.hasText(buttonLabel) && StringUtils.hasText(buttonUrl)
                ? "<div style=\"margin:20px 0 18px 0;text-align:center;\"><a href=\"" + safeButtonUrl
                        + "\" style=\"display:inline-block;background:#2563EB;color:#FFFFFF;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px;\">"
                        + safeButtonLabel + "</a></div>"
                : "";

        return """
                <!doctype html>
                <html>
                  <body style="margin:0;padding:0;background:#F1F5F9;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#0F172A;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:22px 12px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #E2E8F0;">
                            <tr>
                              <td style="padding:20px 24px;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#FFFFFF;">
                                <img src="cid:%s" alt="CampusFix" style="height:40px;width:auto;display:block;">
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:26px 24px 18px 24px;">
                                <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#64748B;">%s</p>
                                <h1 style="margin:10px 0 8px 0;font-size:24px;line-height:1.3;color:#0F172A;">%s</h1>
                                <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">%s</p>
                                %s
                                %s
                                <p style="margin:14px 0 0 0;font-size:13px;line-height:1.5;color:#64748B;">%s</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:14px 24px 22px 24px;border-top:1px solid #E2E8F0;color:#64748B;font-size:12px;line-height:1.5;">
                                CampusFix Systems | Smart Campus Maintenance Platform
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(LOGO_CID, safeTitle, safeHeading, safeIntro, codeBlock, ctaBlock, safeNote);
    }

    private String displayName(String fullName) {
        if (!StringUtils.hasText(fullName)) {
            return "there";
        }
        return fullName.trim();
    }

    private String htmlEscape(String input) {
        if (input == null) {
            return "";
        }
        StringBuilder out = new StringBuilder(input.length());
        for (char c : input.toCharArray()) {
            switch (c) {
                case '&' -> out.append("&amp;");
                case '<' -> out.append("&lt;");
                case '>' -> out.append("&gt;");
                case '"' -> out.append("&quot;");
                case '\'' -> out.append("&#39;");
                default -> out.append(c);
            }
        }
        return out.toString();
    }
}


