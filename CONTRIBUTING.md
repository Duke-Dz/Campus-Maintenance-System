# Contributing to CampusFix

Thank you for your interest in CampusFix — a role-based campus maintenance management system built with Spring Boot and React.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Reporting Issues](#reporting-issues)
- [Pull Requests](#pull-requests)

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/Duke-Dz/campus-maintenance-system.git
   cd campus-maintenance-system
   ```
3. **Set up the project** by following the [local setup instructions](README.md).

---

## Development Workflow

This project follows a **Feature Branch Workflow**.

1. Create a branch for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```
   Branch naming:
   | Prefix | Use for |
   |--------|---------|
   | `feat/` | New features |
   | `fix/` | Bug fixes |
   | `refactor/` | Code cleanup |
   | `docs/` | Documentation changes |
   | `test/` | Test additions or corrections |

2. Make your changes and commit them (see [Commit Messages](#commit-messages)).
3. Push your branch and open a **Pull Request** against `main`.

---

## Coding Standards

### Backend (Java Spring Boot)

- Strictly follow the **Controller → Service → Repository** layered architecture.
- **Never** expose Entity classes directly through the API — always use DTOs.
- Secure all endpoints with `@PreAuthorize` unless they are explicitly public.
- Use the global `exception/` handler; avoid swallowing exceptions with empty `catch` blocks.
- All new service methods should have meaningful Javadoc only where the intent is non-obvious.

### Frontend (React + Vite)

- Use **functional components** with hooks — no class components.
- Keep components focused and reusable; place them in the appropriate `components/` subdirectory.
- Use the existing CSS design tokens and utility classes from `index.css` — avoid ad-hoc inline styles.
- State management: use React Context for global state (auth, theme); local state for component-scoped concerns.

### SQL / Migrations

- All schema changes must go through a **new Flyway migration file** (`VX__description.sql`).
- Never modify existing migration files that have already been applied.
- Migration SQL must be compatible with **MySQL 8.0**.

---

## Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:** `<type>(<scope>): <subject>`

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependency updates |

**Examples:**
```
feat(auth): add MFA email verification flow
fix(ticket): resolve image upload path on Windows
docs(readme): update local setup instructions
refactor(assignment): simplify scoring algorithm
```

---

## Reporting Issues

When opening a bug report, please include:

1. **Steps to reproduce** the issue.
2. **Expected behaviour** vs. **actual behaviour**.
3. **Environment** — OS, Java version, Node version, browser (if frontend).
4. **Logs or screenshots** — backend stack trace or browser console output.

---

## Pull Requests

Before submitting a pull request:

- [ ] The backend compiles: `mvn -q -DskipTests compile`
- [ ] The frontend builds without errors: `npm run build`
- [ ] No new lint errors introduced: `npm run lint`
- [ ] Any new migration file is correctly versioned and tested against a clean database.
- [ ] The PR description clearly explains **what** changed and **why**.

---

> CampusFix is maintained by [Duke Dz](https://github.com/Duke-Dz).
> Contributions that align with the project's architecture and standards are welcome.
