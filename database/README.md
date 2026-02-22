# Database Scripts

This folder contains SQL scripts for MySQL 8+.

## Files

- `schemas/schema.sql`: canonical schema for `Campus_Fix`
- `seed_data.sql`: idempotent demo data insert script

## Setup Order

From project root:

```bash
mysql -u root -p < database/schemas/schema.sql
mysql -u root -p < database/seed_data.sql
```

## Notes

- Database name used by this project: `Campus_Fix`
- `seed_data.sql` is safe to run multiple times.
- Legacy `migrations/` scripts were removed because this project does not use Flyway/Liquibase.
- For production, use managed migration tooling before modifying schema in shared environments.

## ERD

See `schemas/erd.md`.
