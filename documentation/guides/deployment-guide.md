# Deployment Guide

## Option A: Docker Compose (recommended for local team parity)

From repository root:

```bash
docker compose up --build
```

Services started:

- `mysql` on port `3306`
- `backend` on port `8080`
- `frontend` on port `3000`

## Option B: Manual Deployment

1. Provision MySQL 8 and run `database/schemas/schema.sql`.
2. Configure backend environment variables.
3. Build backend JAR:

```bash
cd backend
mvn -q -DskipTests package
```

4. Build frontend static assets:

```bash
cd frontend
npm ci
npm run build
```

5. Serve frontend with Nginx and proxy `/api` to backend.

## Production Notes

- Use strong secrets for `JWT_SECRET` and admin password.
- Disable demo seeding: `APP_SEED_DEMO_DATA=false`.
- Use managed secrets (not plaintext `.env` in shared repos).
- Enable HTTPS at reverse proxy/load balancer.
