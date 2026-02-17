package com.campus.maintenance.dto;

import lombok.Data;

@Data
public class TicketRequest {
    private String title;
    private String description;
    private String priority;
    private String category;
    private String building;
    private String location;
}