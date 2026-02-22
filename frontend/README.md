# Frontend (React + Vite)

CampusFix frontend for students, maintenance staff, and admins.

## Tech Stack

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS

## Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8080`

## Local Setup

```bash
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

The dev server proxies `/api` requests to `http://localhost:8080` (see `vite.config.js`).

## Build

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Authentication UX Flow

- Register -> verify code page
- Verify code -> redirect to login
- Login -> role-based dashboard routing
- Forgot password -> reset email link
- Reset password -> success state, then sign in

## Related Docs

- `../README.md`
- `../documentation/guides/setup-guide.md`
- `../documentation/api/endpoints.md`
