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

## Offline Local DB

For temporary local testing without Postgres:

1. Copy `platform/.env.offline.example` to `platform/.env`
2. Run the backend normally

This uses `sqljs` with auto-save to `platform/backend/.data/dev.sqlite`.

## Production Follow-Up

- add container images for backend and frontend
- add TLS termination and secrets management
- add backups, metrics, and alerting
