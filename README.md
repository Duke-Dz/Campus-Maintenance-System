# CampusFix Maintenance System

CampusFix is a role-based campus maintenance platform for students, maintenance staff, and administrators.

## Start Here

1. Read `documentation/guides/setup-guide.md` for first-time setup.
2. Use `backend/README.md` and `frontend/README.md` for service-specific details.
3. Use `database/README.md` for schema + seed data setup.

## Project Structure

- `backend/` Spring Boot API (Java 21, Maven)
- `frontend/` React + Vite web app (Node 18+)
- `database/` MySQL schema and seed scripts
- `documentation/` setup, testing, deployment, and architecture docs
- `devops/` Docker and Kubernetes manifests
- `cpp-optimization/` optional research module (not required to run core app)
- `uploads/` runtime upload storage

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+
- MySQL 8.0+

## Quick Start (Local)

### 1. Database

From project root:

```bash
mysql -u root -p < database/schemas/schema.sql
mysql -u root -p < database/seed_data.sql
```

This creates and uses database `Campus_Fix`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Windows PowerShell: copy .env.example .env
# Edit .env values (DB, admin, SMTP)
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

### 3. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Default Seed Accounts

`database/seed_data.sql` inserts these demo users (password: `password`):

- `admin_seed` (ADMIN)
- `maintenance_seed` (MAINTENANCE)
- `student_seed` (STUDENT)

Note: The backend can also bootstrap an admin user from `backend/.env` values.

## Email and Password Recovery

- Email verification code is required after registration.
- Forgot password sends a reset link.
- Successful reset sends a confirmation email.
- Configure SMTP in `backend/.env`.

If SMTP is not configured, set `APP_EMAIL_ENABLED=false` for local testing.

## Docker (Optional)

```bash
docker compose up --build
```

Services:

- MySQL: `localhost:3306`
- Backend: `localhost:8080`
- Frontend: `localhost:3000`

## Documentation Index

- `documentation/README.md`
- `documentation/guides/setup-guide.md`
- `documentation/guides/testing-guide.md`
- `documentation/guides/troubleshooting.md`
- `documentation/guides/deployment-guide.md`
- `documentation/guides/admin-credentials-setup.md`

## Verification Commands

```bash
# backend
cd backend
mvn -q -DskipTests compile
mvn -q test

# frontend
cd ../frontend
npm run build
```
