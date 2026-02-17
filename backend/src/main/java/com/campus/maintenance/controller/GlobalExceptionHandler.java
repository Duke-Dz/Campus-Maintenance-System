package com.campus.maintenance.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUsernameNotFound(UsernameNotFoundException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid username or password"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleAuthRuntime(RuntimeException e) {
        String msg = e.getMessage();
        if (msg != null && msg.contains("Invalid username or password")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", msg));
        }
        if (msg != null && msg.contains("Username already exists")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", msg));
        }
        throw e;
    }
}
