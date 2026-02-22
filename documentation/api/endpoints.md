# API Endpoints (Current)

Base URL: `http://localhost:8080/api`

## Public Endpoints

- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /analytics/public-summary`
- `GET /analytics/public-config`
- `POST /public/contact-support`

## Ticket Endpoints (Authenticated)

- `POST /tickets` (JSON)
- `POST /tickets` (multipart with optional image)
- `GET /tickets`
- `GET /tickets/my`
- `GET /tickets/assigned`
- `GET /tickets/{id}`
- `PATCH /tickets/{id}/status`
- `PATCH /tickets/{id}/assign`
- `POST /tickets/{id}/rate`
- `GET /tickets/{id}/logs`
- `POST /tickets/{id}/comments`
- `GET /tickets/{id}/comments`
- `POST /tickets/duplicate-check`
- `POST /tickets/{id}/after-photo` (multipart)

## User/Admin Endpoints (Authenticated)

- `GET /users`
- `GET /users/maintenance`
- `POST /users/staff`

## Other Authenticated Endpoints

- Announcements: `GET /announcements`, `GET /announcements/all`, `POST /announcements`, `PATCH /announcements/{id}/toggle`
- Buildings: `GET /buildings`, `POST /buildings`
- Notifications: `GET /notifications`, `GET /notifications/unread-count`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all`
- Chat: `GET /tickets/{ticketId}/chat`, `POST /tickets/{ticketId}/chat`
- Analytics: `GET /analytics/summary`, `GET /analytics/resolution-time`, `GET /analytics/top-buildings`, `GET /analytics/crew-performance`, `GET /analytics/sla-compliance`, `GET /analytics/export/csv`

## Security Notes

- JWT is required for protected endpoints.
- Role checks are enforced in service layer based on the authenticated user.
- CORS dev origin is configured for `http://localhost:5173`.
