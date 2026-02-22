package com.smartcampus.maintenance.security;

import com.smartcampus.maintenance.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes");
        }
        signingKey = Keys.hmacShaKeyFor(secretBytes);
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("role", user.getRole().name())
            .claim("uid", user.getId())
            .claim("tv", user.getTokenVersion())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(expirationMs)))
            .signWith(signingKey)
            .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        Claims claims = parseClaims(token);
        if (!userDetails.getUsername().equals(claims.getSubject()) || !claims.getExpiration().after(new Date())) {
            return false;
        }

        if (userDetails instanceof AuthenticatedUser authenticatedUser) {
            Number tokenVersionClaim = claims.get("tv", Number.class);
            int tokenVersion = tokenVersionClaim == null ? 0 : tokenVersionClaim.intValue();
            return tokenVersion == authenticatedUser.getTokenVersion();
        }

        return true;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
