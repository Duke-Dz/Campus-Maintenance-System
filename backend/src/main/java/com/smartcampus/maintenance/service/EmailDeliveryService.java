package com.smartcampus.maintenance.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(EmailDeliveryService.class);

    private final JavaMailSender javaMailSender;
    private final String fromAddress;
    private final String mailHost;

    public EmailDeliveryService(
            @Autowired(required = false) JavaMailSender javaMailSender,
            @Value("${app.email.from:no-reply@campusfix.local}") String fromAddress,
            @Value("${spring.mail.host:}") String mailHost) {
        this.javaMailSender = javaMailSender;
        this.fromAddress = fromAddress;
        this.mailHost = mailHost;
    }

    public void send(String to, String subject, String plainText, String htmlBody) {
        if (!canSend(to, subject)) {
            return;
        }
        if (StringUtils.hasText(htmlBody)) {
            sendHtml(to, subject, plainText, htmlBody);
            return;
        }
        sendPlain(to, subject, plainText);
    }

    private void sendPlain(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            javaMailSender.send(message);
        } catch (MailException ex) {
            throw enrichDeliveryException(ex);
        }
    }

    private void sendHtml(String to, String subject, String plainText, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(plainText, htmlBody);
            javaMailSender.send(message);
        } catch (MailException | MessagingException ex) {
            throw enrichDeliveryException(ex);
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

    private RuntimeException enrichDeliveryException(Exception ex) {
        if (isGmailHost(mailHost)) {
            String message = "Gmail SMTP delivery failed. Ensure the mailbox has 2-Step Verification enabled and MAIL_PASSWORD is a Google App Password.";
            log.error(message, ex);
            return new IllegalStateException(message, ex);
        }
        if (ex instanceof RuntimeException runtimeException) {
            return runtimeException;
        }
        return new IllegalStateException("Failed to deliver email", ex);
    }

    private boolean isGmailHost(String host) {
        return StringUtils.hasText(host) && host.trim().equalsIgnoreCase("smtp.gmail.com");
    }
}
