package com.campus.maintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String title;
    private String status;
    private String priority;
    private LocalDateTime createdAt;
}
