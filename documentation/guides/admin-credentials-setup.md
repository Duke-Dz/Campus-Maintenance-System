# Admin Credentials Setup Guide

This guide explains how to configure and use admin credentials for CampusFix.

## 1. How admin bootstrap works

- The backend reads admin values from environment variables.
- On startup:
  - If no `ADMIN` exists, it creates one from `APP_ADMIN_*`.
  - If an `ADMIN` already exists, it synchronizes that admin account to `APP_ADMIN_*` (username, email, full name, password).

## 2. Configure admin credentials (local run)

1. Open a terminal in the project root.
2. Copy the env template:

```powershell
cd backend
copy .env.example .env
```

3. Edit `backend/.env` and set these values:

```properties
APP_ADMIN_USERNAME=admin
APP_ADMIN_EMAIL=admin@campus.local
APP_ADMIN_FULL_NAME=Campus Admin
APP_ADMIN_PASSWORD=ChangeThisAdminPassword123!
```

4. Recommended production-safe values:

```properties
APP_SEED_DEMO_DATA=false
JWT_SECRET=use-a-long-random-secret-at-least-32-characters
DB_URL=jdbc:mysql://localhost:3306/Campus_Fix?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC
```

5. Start backend:

```powershell
mvn spring-boot:run
```

## 3. Login with admin account

- URL: `http://localhost:5173/login` (or your frontend URL)
- Username: `APP_ADMIN_USERNAME`
- Password: `APP_ADMIN_PASSWORD`

After login, admin is routed to `/admin`.

## 4. If admin already exists

Current behavior: backend startup synchronizes existing admin credentials to your configured `APP_ADMIN_*` values.

If sync fails, it is usually because the target username/email already belongs to a different user.

## 5. Docker Compose setup

Set admin env values in `docker-compose.yml` under `java-backend.environment`:

```yaml
APP_ADMIN_USERNAME: admin
APP_ADMIN_EMAIL: admin@campus.local
APP_ADMIN_FULL_NAME: Campus Admin
APP_ADMIN_PASSWORD: change-this-admin-password
```

Then run:

```powershell
docker-compose up --build
```

## 6. Related config keys

- `APP_ADMIN_USERNAME`
- `APP_ADMIN_EMAIL`
- `APP_ADMIN_FULL_NAME`
- `APP_ADMIN_PASSWORD`
- `APP_SEED_DEMO_DATA`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
