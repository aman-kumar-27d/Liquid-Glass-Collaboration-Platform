# Implementation Master Plan: Liquid Glass Collaboration Platform

This document is the authoritative implementation plan adopted for this repository.

## Delivery Strategy

- Backend-first platform
- Web app after backend contracts stabilize
- Mobile app scaffolded now and implemented after web MVP

## Phase Sequence

1. Product and technical foundations
2. Backend core platform
3. Multi-tenant auth and company provisioning
4. Rooms, messaging, and realtime
5. File sharing
6. Video calling and screen sharing
7. Admin, master admin, and subscriptions
8. Analytics and jobs
9. Web application
10. Mobile application
11. Production hardening and deployment

## Repository Baseline

- `platform/backend`: NestJS API, websocket, worker shells
- `platform/frontend`: Next.js App Router shell
- `platform/mobile`: Expo scaffold
- `platform/infra`: Docker Compose, Nginx, Coturn config
- `platform/docs`: architecture and operating docs

## Delivery Rules

- Keep tenant isolation as a first-class invariant
- Use `/api/v1` for all public API routes
- Maintain docs with each implementation phase
- Avoid premature microservice splitting; keep modular monolith boundaries clean

## Current Implementation State

The repository currently includes:

- workspace scaffolding
- backend foundation with auth, company, user, and health modules
- rooms, messaging, file storage, call/screen-sharing, and admin/subscription backend baselines
- database entities and migrations through current Phase 7 backend baseline
- frontend liquid-glass shell
- mobile scaffold
- infra and engineering docs
- offline local DB mode for temporary development
- dependency baseline updated locally to newer versions, including Next.js 16 and newer Nest packages

Still pending:

- P2P large-file transfer
- analytics/jobs
- real frontend feature implementation
- real mobile feature implementation
- production hardening and broader test coverage
