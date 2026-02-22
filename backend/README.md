# Backend (Spring Boot)

This service provides authentication, ticket management, analytics, notifications, and email flows for CampusFix.

## Tech Stack

- Java 21
- Spring Boot 3.5
- Spring Security + JWT
- Spring Data JPA
- MySQL 8 (primary) or H2 (fallback)

## Prerequisites

- Java 21+
- Maven 3.9+
- MySQL 8+ (recommended)

## Local Setup

### 1. Configure environment

```bash
cp .env.example .env
# Windows PowerShell: copy .env.example .env
```

Set at least:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `APP_ADMIN_USERNAME`
- `APP_ADMIN_EMAIL`
- `APP_ADMIN_PASSWORD`

### 2. Run backend

```bash
mvn spring-boot:run
```

API base URL: `http://localhost:8080/api`

## Key Environment Variables

- `DB_URL=jdbc:mysql://localhost:3306/Campus_Fix?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC`
- `DB_USERNAME=root`
- `DB_PASSWORD=...`
- `JWT_SECRET=...`
- `JWT_EXPIRATION_MS=86400000`
- `FRONTEND_BASE_URL=http://localhost:5173`

Admin bootstrap:

- `APP_ADMIN_USERNAME`
- `APP_ADMIN_EMAIL`
- `APP_ADMIN_FULL_NAME`
- `APP_ADMIN_PASSWORD`

Email system:

- `APP_EMAIL_ENABLED=false` (set `true` when SMTP is ready)
- `APP_EMAIL_FROM`
- `APP_EMAIL_SUPPORT_INBOX`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

Auth timing:

- `APP_AUTH_VERIFICATION_CODE_TTL_MINUTES`
- `APP_AUTH_RESET_TOKEN_TTL_MINUTES`
- `APP_AUTH_VERIFICATION_CODE_MAX_ATTEMPTS`
- `APP_AUTH_VERIFICATION_RESEND_COOLDOWN_SECONDS`
- `APP_AUTH_RESET_REQUEST_COOLDOWN_SECONDS`
- `APP_AUTH_PUBLIC_REQUEST_MIN_DELAY_MS`
- `APP_AUTH_TOKEN_CLEANUP_CRON`
- `APP_AUTH_USED_TOKEN_RETENTION_HOURS`

## Auth Flow

- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Build and Test

```bash
mvn -q -DskipTests compile
mvn -q test
```

## Notes

- CORS allows frontend dev origin `http://localhost:5173`.
- Uploaded files are served under `/uploads/**`.
- If DB schema is managed manually, run scripts from `../database/` first.

## Related Docs

- `../documentation/guides/setup-guide.md`
- `../documentation/guides/admin-credentials-setup.md`
- `../documentation/guides/troubleshooting.md`
- `../documentation/guides/email-production-checklist.md`
