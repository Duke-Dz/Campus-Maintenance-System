package com.campus.maintenance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetCode(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject("CampusFix password reset code");
            message.setText("Use this verification code to reset your password: " + code + "\nThis code expires in 15 minutes.");
            mailSender.send(message);
            log.info("Password reset code sent to {}", to);
        } catch (Exception ex) {
            log.warn("Mail server unavailable; reset code for {} is {}", to, code);
        }
    }
}
