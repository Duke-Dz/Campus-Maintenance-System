package com.smartcampus.maintenance.config;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class EmailConfigurationValidator {

    private static final Logger log = LoggerFactory.getLogger(EmailConfigurationValidator.class);

    private final boolean emailEnabled;
    private final String fromAddress;
    private final String mailHost;
    private final int mailPort;
    private final String mailUsername;
    private final String mailPassword;

    public EmailConfigurationValidator(
            @Value("${app.email.enabled:false}") boolean emailEnabled,
            @Value("${app.email.from:}") String fromAddress,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${spring.mail.port:0}") int mailPort,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword) {
        this.emailEnabled = emailEnabled;
        this.fromAddress = fromAddress;
        this.mailHost = mailHost;
        this.mailPort = mailPort;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
    }

    @PostConstruct
    public void validate() {
        if (!emailEnabled) {
            return;
        }

        List<String> missing = new ArrayList<>();
        if (!StringUtils.hasText(fromAddress)) {
            missing.add("APP_EMAIL_FROM");
        }
        if (!StringUtils.hasText(mailHost)) {
            missing.add("MAIL_HOST");
        }
        if (mailPort <= 0) {
            missing.add("MAIL_PORT");
        }
        if (!missing.isEmpty()) {
            throw new IllegalStateException(
                    "Email delivery is enabled but required configuration is missing: " + String.join(", ", missing));
        }

        if (isGmailHost(mailHost)) {
            if (!StringUtils.hasText(mailUsername) || !StringUtils.hasText(mailPassword)) {
                throw new IllegalStateException(
                        "Gmail SMTP requires MAIL_USERNAME and a Google App Password in MAIL_PASSWORD when APP_EMAIL_ENABLED=true.");
            }
            log.info("Gmail SMTP detected. Ensure the account has 2-Step Verification enabled and MAIL_PASSWORD is a Google App Password.");
        }
    }

    private boolean isGmailHost(String host) {
        return StringUtils.hasText(host) && host.trim().equalsIgnoreCase("smtp.gmail.com");
    }
}
