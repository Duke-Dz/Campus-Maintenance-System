package com.campus.maintenance.config;

import com.campus.maintenance.entity.User;
import com.campus.maintenance.model.SocialLink;
import com.campus.maintenance.repository.SocialLinkRepository;
import com.campus.maintenance.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapData {
    private static final Logger log = LoggerFactory.getLogger(BootstrapData.class);

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            SocialLinkRepository socialLinkRepository,
            PasswordEncoder encoder,
            @Value("${app.admin.name}") String adminName,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword
    ) {
        return args -> {
            if (userRepository.findByUsername(adminUsername).isEmpty()) {
                User admin = new User();
                admin.setName(adminName);
                admin.setUsername(adminUsername);
                admin.setEmail(adminEmail);
                admin.setPassword(encoder.encode(adminPassword));
                admin.setRole(User.Role.ADMIN);
                admin.setActive(true);
                userRepository.save(admin);
                log.info("Created default admin account: {}", adminUsername);
            }

            createLinkIfMissing(socialLinkRepository, "facebook", "https://www.facebook.com");
            createLinkIfMissing(socialLinkRepository, "x", "https://x.com");
            createLinkIfMissing(socialLinkRepository, "instagram", "https://www.instagram.com");
            createLinkIfMissing(socialLinkRepository, "linkedin", "https://www.linkedin.com");
        };
    }

    private void createLinkIfMissing(SocialLinkRepository repository, String platform, String url) {
        if (repository.findByPlatformIgnoreCase(platform).isEmpty()) {
            SocialLink link = new SocialLink();
            link.setPlatform(platform);
            link.setUrl(url);
            repository.save(link);
        }
    }
}
