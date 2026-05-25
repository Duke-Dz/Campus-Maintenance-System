# CampusFix >> Campus Maintenance System

A role-based campus maintenance platform for students, maintenance staff, and administrators.

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+
- MySQL 8.0+

---

## Running Locally

### 1. Database

Run the Flyway migrations automatically on first backend startup — no manual SQL import needed.

If you prefer to pre-create the database manually:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Campus_Fix CHARACTER SET utf8mb4;"
```

### 2. Backend

```powershell
cd backend
copy .env.example .env
```

Edit `.env` and set at minimum:

```
DB_URL=jdbc:mysql://localhost:3306/Campus_Fix
DB_USERNAME=root
DB_PASSWORD=yourpassword
APP_SEED_BOOTSTRAP_ADMIN=true
APP_ADMIN_USERNAME=admin
APP_ADMIN_EMAIL=admin@campus.local
APP_ADMIN_PASSWORD=YourStrongPassword123!
APP_EMAIL_ENABLED=false
```

Start the backend:

```powershell
mvn spring-boot:run -DskipTests
```

Backend runs at: `http://localhost:8080`

> **Tip:** Use the `fast` profile during development to speed up startup:
> ```powershell
> mvn spring-boot:run -DskipTests "-Dspring-boot.run.profiles=fast"
> ```

### 3. Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Default Admin Account

Configured via `backend/.env` — see `APP_ADMIN_*` variables above. The admin account is created automatically on first startup when `APP_SEED_BOOTSTRAP_ADMIN=true`.

---

## Email (Optional)

Email is disabled by default (`APP_EMAIL_ENABLED=false`). To enable for local testing, configure SMTP in `.env`:

```
APP_EMAIL_ENABLED=true
MAIL_HOST=smtp.example.com
MAIL_USERNAME=your-user
MAIL_PASSWORD=your-password
APP_EMAIL_FROM=no-reply@yourdomain.com
```

---

## Docker (Optional)

```powershell
copy backend/.env.example backend/.env
# Edit backend/.env with strong secrets
docker compose up --build
```

Services:

| Service  | URL                    |
|----------|------------------------|
| Backend  | http://localhost:8080  |
| Frontend | http://localhost:3000  |
| MySQL    | localhost:3306         |

---

## Project Structure

```
backend/    Spring Boot API (Java 21, Maven)
frontend/   React + Vite web app (Node 18+)
uploads/    Runtime file upload storage
```
