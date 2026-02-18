package com.smartcampus.maintenance.mapper;

import com.smartcampus.maintenance.dto.ticket.TicketUserInfoResponse;
import com.smartcampus.maintenance.dto.user.UserSummaryResponse;
import com.smartcampus.maintenance.dto.user.UserWithTicketCountResponse;
import com.smartcampus.maintenance.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static TicketUserInfoResponse toTicketUserInfo(User user) {
        if (user == null) {
            return null;
        }
        return new TicketUserInfoResponse(user.getId(), user.getUsername(), user.getFullName(), user.getRole().name());
    }

    public static UserSummaryResponse toSummary(User user) {
        return new UserSummaryResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getCreatedAt()
        );
    }

    public static UserWithTicketCountResponse toWithTicketCount(User user, long ticketCount) {
        return new UserWithTicketCountResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            ticketCount
        );
    }
}
