# Testing Guide

## Backend

From `backend/`:

```bash
mvn -q -DskipTests compile
mvn -q test
```

## Frontend

From `frontend/`:

```bash
npm run lint
npm run build
```

## Manual Smoke Flow

Test this sequence against a running backend:

1. Register account
2. Verify email code
3. Login
4. Forgot password
5. Reset password
6. Login with new password

## API Health Checks

- `GET /api/analytics/public-config`
- `GET /api/analytics/public-summary`

Both should return `200`.
