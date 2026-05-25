package com.smartcampus.maintenance.entity;

import com.smartcampus.maintenance.entity.enums.Role;
import com.smartcampus.maintenance.entity.enums.TechnicianSpecialty;
import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "token_version", nullable = false)
    private int tokenVersion = 0;

    @Column(name = "mfa_enabled", nullable = false)
    private boolean mfaEnabled = false;

    @ElementCollection(targetClass = TechnicianSpecialty.class)
    @CollectionTable(name = "user_specialties", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "specialty", nullable = false, length = 40)
    private Set<TechnicianSpecialty> specialties = EnumSet.noneOf(TechnicianSpecialty.class);

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public int getTokenVersion() {
        return tokenVersion;
    }

    public void setTokenVersion(int tokenVersion) {
        this.tokenVersion = tokenVersion;
    }

    public boolean isMfaEnabled() {
        return mfaEnabled;
    }

    public void setMfaEnabled(boolean mfaEnabled) {
        this.mfaEnabled = mfaEnabled;
    }

    public Set<TechnicianSpecialty> getSpecialties() {
        if (specialties == null || specialties.isEmpty()) {
            return EnumSet.noneOf(TechnicianSpecialty.class);
        }
        return EnumSet.copyOf(specialties);
    }

    public void setSpecialties(Set<TechnicianSpecialty> specialties) {
        if (specialties == null || specialties.isEmpty()) {
            this.specialties = EnumSet.noneOf(TechnicianSpecialty.class);
            return;
        }
        this.specialties = EnumSet.copyOf(specialties);
    }
}
