# Troubleshooting Guide

## Backend fails to start

- Confirm Java 21: `java -version`
- Confirm Maven: `mvn -version`
- Confirm DB credentials in `backend/.env`
- Check backend logs for SQL or SMTP errors

## Cannot connect to MySQL

- Ensure MySQL is running on expected host/port
- Verify `DB_URL` points to `Campus_Fix`
- Re-run schema script if tables are missing

## Login returns unauthorized

- Verify username/password
- For new accounts, complete email verification first
- For admin bootstrap, confirm `APP_ADMIN_*` values and restart backend

## Email not sending

- Set `APP_EMAIL_ENABLED=true`
- Verify SMTP settings (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`)
- For Gmail, use an app password (not normal account password)

## Frontend API errors

- Ensure backend is on `http://localhost:8080`
- Keep frontend on `http://localhost:5173` for local dev
- Confirm Vite proxy config in `frontend/vite.config.js`

## Reset link opens wrong host

Set `FRONTEND_BASE_URL` in `backend/.env` to your frontend URL.
