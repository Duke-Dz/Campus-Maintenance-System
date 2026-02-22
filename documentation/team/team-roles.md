# Team Roles Template

Use this file to assign ownership clearly during development.

## Suggested Ownership Areas

- Frontend: routing, dashboards, UX, client validation
- Backend: authentication, tickets, analytics, notifications, email
- Database: schema versioning, indexing, seed strategy
- QA: integration tests, regression checks, smoke tests
- DevOps: Docker, environment setup, release process
- Documentation: setup guides and API references

## Minimum Role Assignments

- 1 project lead
- 1 frontend owner
- 1 backend owner
- 1 database owner
- 1 QA/release owner

## Working Agreement

- Keep README and docs in sync with code changes.
- Update `database/schemas/schema.sql` whenever entity model changes.
- Run backend + frontend verification commands before merging.
