package com.smartcampus.maintenance.service;

import com.smartcampus.maintenance.entity.User;
import com.smartcampus.maintenance.exception.UnauthorizedException;
import com.smartcampus.maintenance.repository.UserRepository;
import com.smartcampus.maintenance.security.AuthenticatedUser;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new UnauthorizedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof AuthenticatedUser authUser)) {
            throw new UnauthorizedException("Authentication required");
        }
        return userRepository.findById(authUser.getId())
            .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
