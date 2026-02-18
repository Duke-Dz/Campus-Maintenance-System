package com.smartcampus.maintenance.security;

import com.smartcampus.maintenance.exception.UnauthorizedException;
import com.smartcampus.maintenance.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .map(AuthenticatedUser::new)
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
    }
}
