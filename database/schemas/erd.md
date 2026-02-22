# CampusFix ERD Summary

Database: `Campus_Fix`

## Core Relationships

```mermaid
erDiagram
    USERS ||--o{ TICKETS : creates
    USERS ||--o{ TICKETS : assigned_to
    USERS ||--o{ ANNOUNCEMENTS : creates
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ TICKET_LOGS : changes
    USERS ||--o{ TICKET_COMMENTS : writes
    USERS ||--o{ CHAT_MESSAGES : sends
    USERS ||--o{ TICKET_RATINGS : rates
    USERS ||--o{ PASSWORD_RESET_TOKENS : owns
    USERS ||--o{ EMAIL_VERIFICATION_TOKENS : owns

    TICKETS ||--o{ TICKET_LOGS : has
    TICKETS ||--o{ TICKET_COMMENTS : has
    TICKETS ||--o{ CHAT_MESSAGES : has
    TICKETS ||--o| TICKET_RATINGS : may_have
```

## Main Tables

- `users`
- `tickets`
- `ticket_logs`
- `ticket_comments`
- `chat_messages`
- `ticket_ratings`
- `announcements`
- `notifications`
- `support_requests`
- `password_reset_tokens`
- `email_verification_tokens`
- `buildings`
