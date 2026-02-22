# DevOps Assets

This folder contains deployment-related artifacts.

## Contents

- `docker/` Dockerfiles used by root `docker-compose.yml`
- `kubernetes/` baseline manifests for backend service deployment

## Usage

For local team setup, prefer root-level Docker Compose:

```bash
docker compose up --build
```

Kubernetes manifests are templates and should be environment-specific before production use.
