# CampusFix

CampusFix is a professional campus maintenance management platform designed to streamline issue reporting, assignment workflows, service execution, and administrative oversight across university environments.

This project was architected, implemented, and maintained as a solo initiative by **Duke-Dz**. It represents a comprehensive full-stack system designed entirely by me, managing everything from the database schema and robust backend services to the modern frontend interface. Note: Earlier iterations included C++ optimizations, which have since been removed to streamline the architecture around a pure Java/React stack.

## Platform Overview

CampusFix delivers an end-to-end maintenance workflow with:

- Role-based access for students, maintenance personnel, and administrators
- Ticket lifecycle management with assignment and status tracking
- Analytics and operational visibility for campus maintenance performance
- Secure authentication, email verification, and password recovery flows
- RESTful backend services and a modern React-based web interface

## Technology Stack

- **Backend:** Spring Boot (Java 21, Maven)
- **Frontend:** React + Vite (Node.js 18+)
- **Database:** MySQL 8.0
- **Infrastructure:** Docker Compose and Kubernetes manifests

## Repository Structure

- `backend/` Spring Boot API and business logic
- `frontend/` React application and UI components
- `database/` schema and seed scripts
- `documentation/` setup guides, API references, architecture, testing, and deployment notes
- `devops/` container and orchestration resources

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+
- MySQL 8.0+

### Setup Sequence

1. Review `documentation/guides/setup-guide.md`.
2. Configure and run the backend from `backend/README.md`.
3. Configure and run the frontend from `frontend/README.md`.
4. Initialize the database using `database/README.md`.

## Documentation

- `documentation/README.md` - complete documentation index
- `documentation/guides/setup-guide.md` - first-time local environment setup
- `documentation/guides/testing-guide.md` - test execution and verification workflows
- `documentation/guides/troubleshooting.md` - diagnostics and issue resolution guidance
- `documentation/guides/deployment-guide.md` - deployment process and environment expectations
- `documentation/guides/admin-credentials-setup.md` - secure admin bootstrapping instructions
- `documentation/guides/email-production-checklist.md` - production email readiness checklist

## Verification Commands

```bash
# backend
cd backend
mvn -q -DskipTests compile
mvn -q test

# frontend
cd ../frontend
npm run lint
npm run build
```
