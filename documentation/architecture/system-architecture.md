# System Architecture

CampusFix uses a standard three-layer web architecture.

## Layers

1. Frontend (`frontend/`)
- React + Vite SPA
- Handles role-based UI routing and forms
- Calls backend through `/api`

2. Backend (`backend/`)
- Spring Boot REST API
- Handles auth, business rules, validation, email, and file uploads
- Uses JWT for stateless auth

3. Database (`database/`)
- MySQL 8 schema (`Campus_Fix`)
- Relational tables for users, tickets, logs, comments, notifications, and auth tokens

## Runtime Data Flow

1. User submits action in frontend.
2. Frontend sends HTTP request to backend.
3. Backend authenticates/authorizes and applies business rules.
4. Backend writes/reads MySQL and returns JSON response.
5. Frontend updates UI state.

## Auth and Email Flows

- Registration creates a student account in unverified state.
- Verification code is sent by email.
- User verifies code before first login.
- Forgot password sends reset link email.
- Successful reset triggers password-changed confirmation email.

## Optimization Approach

- Assignment scoring and safe upload optimization run in pure Java within the backend optimization package.

## Related Documents

- `../api/endpoints.md`
- `../guides/setup-guide.md`
- `../guides/deployment-guide.md`
