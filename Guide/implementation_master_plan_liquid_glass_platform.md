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

Implemented now:

- monorepo workspace and local infrastructure baseline
- backend phases through the Phase 7 baseline:
  - auth, tenant provisioning, sessions, and audit logging
  - rooms, room membership, messages, reactions, and websocket signaling baseline
  - local and MinIO-oriented file storage abstraction baseline
  - call lifecycle and screen-share signaling baseline
  - admin, master admin, subscriptions, coupons, and redeem-code backend surfaces
- database entities and migrations through the current backend baseline
- offline local DB mode for temporary development
- dependency baseline upgraded locally, including Next.js 16 and current Nest packages
- Phase 8 web baseline:
  - landing page
  - auth surface with live login and owner registration
  - workspace dashboard with live room and subscription reads
  - chat workspace with live room reads, room creation, staged file uploads, text message sending, websocket room join, presence, and typing state
  - calls workspace with live active-call reads plus start, join, leave, and websocket call-room synchronization
  - admin workspace with live tenant user and room reads plus user activation toggles
  - billing workspace with live plan reads plus change-plan, coupon, and redeem-code actions

Still pending:

- P2P large-file transfer and transfer-state workflows
- analytics and background jobs
- deeper call signaling, file upload UX, and route-level loading/error polish
- real mobile feature implementation
- production hardening, monitoring, and broader automated test coverage
