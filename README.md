# Smart Campus Maintenance System

Role-based campus maintenance platform for reporting, routing, and resolving facility issues with live analytics.

## Stack
- Frontend: React 18 + Vite + Tailwind + React Router + Axios
- Backend: Spring Boot 3.5 (Java 21) + Spring Security + JPA
- Database: H2 (default, file-based) with optional MySQL configuration

## Current Highlights
- Role-based authentication and protected dashboards
- Public landing page with:
  - Real-time analytics snapshot (`/api/analytics/public-summary`)
  - Public support configuration (`/api/analytics/public-config`)
  - Responsive navbar with mobile menu toggle
  - Scroll reveal animations and mobile-friendly layout
- Public support form endpoint:
  - `POST /api/public/contact-support`

## Repository Structure
- `frontend/` React application
- `backend/` Spring Boot API
- `database/` SQL scripts/assets
- `cpp-optimization/` optimization module area
- `devops/` deployment-related files
- `documentation/` project docs

## Prerequisites
- Node.js 18+
- Java 21+
- Maven 3.9+

## Run Locally

### 1. Backend
```bash
cd backend
mvn spring-boot:run
```

Backend defaults:
- Base URL: `http://localhost:8080`
- H2 console: `http://localhost:8080/h2-console`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend default:
- App URL: `http://localhost:5173`

## Main Config (Backend)
File: `backend/src/main/resources/application.properties`

Key values:
- `jwt.secret`
- `jwt.expiration-ms`
- `app.email.enabled`
- `app.email.from`
- `app.landing.support-hours`
- `app.landing.support-phone`
- `app.landing.support-timezone`

Note: restart backend after changing `application.properties`.

## Public Endpoints
- `GET /api/analytics/public-summary`
- `GET /api/analytics/public-config`
- `POST /api/public/contact-support`

## Security Notes
- JWT auth is required for protected API routes.
- Public routes are explicitly allowlisted in `SecurityConfig`.
- CORS currently allows `http://localhost:5173`.

## Verification Commands

### Frontend
```bash
cd frontend
npx eslint src
npm run build
```

### Backend
```bash
cd backend
mvn -q -DskipTests compile
```

## Responsive Behavior
- Desktop: full top navigation and auth actions
- Mobile: navbar collapses into a menu button with in-panel navigation/actions
- Mobile menu closes on section select, `Esc`, and desktop resize

