# Deployment Runbook

## Local Stack

Run from `platform/infra`:

```bash
docker compose up -d
```

Services:

- PostgreSQL on `5432`
- Redis on `6379`
- MinIO API on `9000`, console on `9001`
- Coturn on `3478`

## Application Start

Run from `platform/`:

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

## Production Follow-Up

- add container images for backend and frontend
- add TLS termination and secrets management
- add backups, metrics, and alerting
