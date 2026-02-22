# Setup Guide

This guide gets CampusFix running on a new machine.

## 1. Prerequisites

Install:

- Java 21+
- Maven 3.9+
- Node.js 18+
- MySQL 8+

## 2. Clone and Open Project

```bash
git clone <repo-url>
cd campus-maintenance-system
```

## 3. Create Database

Run from project root:

```bash
mysql -u root -p < database/schemas/schema.sql
mysql -u root -p < database/seed_data.sql
```

This creates database `Campus_Fix` and inserts demo seed records.

## 4. Backend Setup

```bash
cd backend
cp .env.example .env
# Windows PowerShell: copy .env.example .env
```

Edit `backend/.env`:

- Set DB credentials (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`)
- Set admin bootstrap credentials (`APP_ADMIN_*`)
- Set a strong `JWT_SECRET`
- Configure SMTP only when ready (`APP_EMAIL_ENABLED=true`)

Start backend:

```bash
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

## 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## 6. Verify System

- Open frontend login page.
- Use seeded user `admin_seed` / `password`.
- Register a new user and verify email flow.

## 7. Optional Docker Setup

From root:

```bash
docker compose up --build
```

Use this if your team wants a containerized local environment.

## Related Docs

- `admin-credentials-setup.md`
- `testing-guide.md`
- `troubleshooting.md`
