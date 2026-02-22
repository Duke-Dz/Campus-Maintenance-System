# Tests Folder

This folder is reserved for cross-service and end-to-end test assets.

## Current Status

The main automated backend tests live in `backend/src/test`.

Use these commands for now:

```bash
cd backend
mvn -q test

cd ../frontend
npm run build
```

Add API/E2E suites here only when they are executable in CI.
