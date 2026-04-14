# Liquid Glass Collaboration Platform

This repository contains the initial implementation scaffold for the Liquid Glass Collaboration Platform.

## Workspace

- `Guide/`: source planning and project documents
- `platform/backend`: NestJS backend foundation
- `platform/frontend`: Next.js web foundation
- `platform/mobile`: Expo mobile scaffold
- `platform/infra`: local infrastructure and deployment config
- `platform/docs`: execution-ready engineering documentation

## Quick Start

1. Copy `platform/.env.example` to `platform/.env`.
2. Start infrastructure with Docker Compose from `platform/infra/docker-compose.yml`.
3. Install workspace dependencies from `platform/` with `npm install`.
4. Run the backend with `npm run dev:backend`.
5. Run the frontend with `npm run dev:frontend`.

## Status

This commit implements the monorepo baseline, core backend foundations, API contract stubs, documentation, and infrastructure required to start delivery against the master plan.
