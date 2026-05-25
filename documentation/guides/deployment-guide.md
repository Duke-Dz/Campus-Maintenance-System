# Deployment Guide

## Option A: Docker Compose (recommended for local development)

From repository root:

```bash
copy backend/.env.example backend/.env
# or: cp backend/.env.example backend/.env
# then set strong values before starting
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

- Set `SPRING_PROFILES_ACTIVE=prod` for all non-local deployments.
- Use strong secrets for `JWT_SECRET`, database credentials, SMTP credentials, and the bootstrap admin password.
- Keep `APP_SEED_DEMO_DATA=false` and `H2_CONSOLE_ENABLED=false`.
- Set `APP_CORS_ALLOWED_ORIGINS` to the real frontend origin only.
- Use managed secrets or secret stores, not plaintext files committed to shared repos.
- Enable HTTPS at the ingress/load balancer and set `FRONTEND_BASE_URL` to the public HTTPS URL.
- Mount persistent storage for `APP_UPLOAD_DIR` or move uploads to object storage before scaling past one backend replica.

## Transactional Email (Recommended Production Setup)

Use Resend via SMTP with a custom sender domain. Set these backend variables in production:

- `APP_EMAIL_ENABLED=true`
- `APP_EMAIL_FROM=no-reply@mail.example.com`
- `APP_EMAIL_SUPPORT_INBOX=support@example.com`
- `MAIL_HOST=smtp.resend.com`
- `MAIL_PORT=587`
- `MAIL_USERNAME=resend`
- `MAIL_PASSWORD=<your Resend API key>`

DNS rollout:

- Add the SPF and DKIM records generated in the Resend dashboard for your sender domain.
- Publish a DMARC record starting with `p=none`, validate alignment and inbox placement, then tighten the policy later.
- Do not use Gmail SMTP for production traffic. Keep it only as an optional local/dev fallback.
