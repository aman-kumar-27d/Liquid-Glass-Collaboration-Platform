# Liquid Glass Collaboration Platform

This repository contains the active implementation of the Liquid Glass Collaboration Platform.

## Workspace

- `Guide/`: source planning and project documents
- `platform/backend`: NestJS backend foundation
- `platform/frontend`: Next.js web foundation
- `platform/mobile`: Expo mobile scaffold
- `platform/infra`: local infrastructure and deployment config
- `platform/docs`: execution-ready engineering documentation

## Quick Start

1. Copy `platform/.env.example` to `platform/.env`.
   For offline local testing without Postgres, use `platform/.env.offline.example` instead.
2. Start infrastructure with Docker Compose from `platform/infra/docker-compose.yml`.
3. Install workspace dependencies from `platform/` with `npm install`.
4. Run the backend with `npm run dev:backend`.
5. Run the frontend with `npm run dev:frontend`.

## Status

The repository now includes:

- backend foundations through the Phase 7 baseline: auth, tenancy, rooms, messaging, files, calls, admin, and subscription APIs
- a Phase 8 web baseline with live auth/session handling plus dashboard, chat, calls, admin, and billing workspace flows wired to the current backend APIs
- websocket client wiring for chat room membership, message fanout, presence, typing state, and call join/leave synchronization
- chat file management UX with staged attachments, authenticated downloads, real staged-file removal, and per-file upload progress mapped to the current file metadata and message `fileIds` flow
- call and screen-share UX with local media capture, WebRTC offer/answer/candidate signaling, participant media tiles, mic/camera toggles, reconnect-aware signaling recovery, and socket-driven share state
- Expo mobile scaffold
- Docker and local infrastructure configuration
- offline local DB mode for temporary development

Major work still pending:

- analytics and background jobs
- P2P large-file transfer depth
- production-grade media controls, fallback states, and richer loading/error states
- real mobile feature implementation
- production hardening and broader automated tests
