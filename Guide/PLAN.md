# Implementation Master Plan: Liquid Glass Collaboration Platform

## Summary
Build the platform as a monorepo with **backend-first delivery**, then layer web experience, then mobile once backend contracts, realtime flows, auth, and tenant boundaries are stable. Treat this document as the single implementation source of truth and, when execution mode is enabled, save it as `Guide/implementation_master_plan_liquid_glass_platform.md`.

Primary outcome:
- Enterprise multi-tenant collaboration platform for up to 5000 users
- Backend platform first
- Web app second
- Mobile app after API and websocket contracts stabilize
- Self-hosted deployment with Docker, Nginx, PostgreSQL, Redis, MinIO, STUN/TURN

Chosen defaults:
- Monorepo: `platform/` with `backend/`, `frontend/`, `mobile/`, `infra/`, `docs/`
- Backend: NestJS modular monolith first, microservice-ready boundaries, no early service split
- Frontend: Next.js App Router, TypeScript, Tailwind, Framer Motion
- Mobile: Expo React Native, starts after web MVP contracts are stable
- DB: PostgreSQL with strict tenant scoping on all company-owned data
- Realtime: Socket.IO with Redis adapter
- Object storage: MinIO for small/normal uploads
- Large file transfer: WebRTC data channel, peer-to-peer, signaling via backend
- Auth: JWT access token + refresh token, RBAC, session tracking
- API versioning: `/api/v1`
- Deployment target: Docker Compose first, production-ready for later Kubernetes or multi-node rollout

## Implementation Changes

### 1. Repository and Architecture Baseline
Create a monorepo with these top-level packages:
- `backend/`: NestJS API, websocket gateway, jobs
- `frontend/`: Next.js web app
- `mobile/`: Expo app scaffold only until Phase 8
- `infra/`: Docker, Nginx, MinIO, Postgres, Redis, Coturn config
- `docs/`: ADRs, API contracts, environment setup, runbooks

Backend structure:
- `apps/api`, `apps/websocket`, `apps/worker`
- `modules/auth`, `companies`, `users`, `rooms`, `messages`, `files`, `video`, `screen`, `notifications`, `analytics`, `subscription`, `coupons`, `redeem`, `admin`, `master`
- `common`, `shared`, `config`, `database`, `test`

Non-negotiable architecture rules:
- Modular monolith first
- No direct cross-module DB access except through owned repository/service boundary
- Tenant context resolved on every authenticated request and websocket connection
- All company-owned tables include `company_id`
- Soft delete for business-critical entities where recovery/audit matters
- Audit trail for auth, admin, subscription, and destructive moderation actions

### 2. Domain and Data Model
Finalize the schema before implementation; expand the draft docs to cover missing operational fields.

Core entities:
- `companies`
- `users`
- `sessions`
- `rooms`
- `room_members`
- `messages`
- `message_reactions`
- `message_threads` or parent-child relation on `messages`
- `files`
- `file_transfers`
- `video_calls`
- `call_participants`
- `screen_shares`
- `subscriptions`
- `plans`
- `redeem_codes`
- `coupons`
- `coupon_redemptions`
- `analytics_daily_snapshots`
- `notifications`
- `audit_logs`

Required schema refinements:
- Use UUID primary keys everywhere
- Add `updated_at` to mutable tables
- Add `deleted_at` where soft delete is needed
- Add unique constraints:
  - `users(company_id, email)`
  - `room_members(room_id, user_id)`
  - `redeem_codes(code)`
  - `coupons(code)`
- Add indexes:
  - `messages(room_id, created_at desc)`
  - `rooms(company_id, type)`
  - `users(company_id, role, is_active)`
  - `files(message_id)`
  - `video_calls(room_id, started_at desc)`
- Use enums for:
  - user role
  - room type
  - message type
  - subscription plan
  - file transfer type
  - notification type
- Model message editing/deletion explicitly:
  - `edited_at`
  - `deleted_at`
  - optional `metadata` JSONB for system events
- Model presence separately from user profile; do not persist volatile status in `users`

### 3. Public Interfaces and Contracts
REST API remains versioned under `/api/v1`, but endpoints need to be normalized by resource and tenant-safe behavior.

Required REST surface:
- `auth`: register company owner, login, refresh, logout, me, revoke session
- `companies`: create, view, update company profile, list for master admin
- `users`: list users in tenant, invite/create, update role/profile, deactivate
- `rooms`: create, list, details, join, leave, add/remove member
- `messages`: list by room with pagination, create, edit, delete, react, thread reply
- `files`: upload init, upload complete, file metadata fetch, signed download
- `calls`: start, join, leave, end, list active call by room
- `screen-share`: start, stop
- `subscriptions`: plans, current subscription, change plan, redeem code, apply coupon
- `analytics`: tenant dashboard, usage summaries
- `admin`: user management, room management, moderation actions
- `master`: companies, subscriptions, system stats, coupons, redeem codes

Required websocket namespaces/events:
- connection auth with tenant/user context
- room join/leave
- message created/updated/deleted
- reaction added/removed
- typing start/stop
- presence changed
- call signaling: offer, answer, candidate, join_call, leave_call
- file transfer signaling for P2P large files
- notification pushed

Response standards:
- envelope with `success`, `data`, `error`, `meta`
- cursor pagination for list endpoints
- consistent error codes for auth, tenant violation, permission denied, validation, rate limit, conflict

### 4. Phase Plan

#### Phase 0: Product and Technical Foundations
Deliverables:
- Monorepo scaffolding
- ADRs for tenant model, auth, websocket strategy, file strategy, call signaling
- Environment config template
- Docker Compose for local stack
- CI baseline for lint, typecheck, tests

Exit criteria:
- Local dev stack boots with Postgres, Redis, MinIO, backend shell, frontend shell
- Initial docs exist for env setup and module ownership

#### Phase 1: Backend Core Platform
Deliverables:
- NestJS app shells
- Config system
- Logger
- Global validation
- Exception filters
- DB connection and migration system
- Redis and MinIO adapters
- Health and readiness endpoints

Exit criteria:
- Backend runs with migrations and health endpoints
- CI passes
- All infrastructure dependencies wired in non-production mode

#### Phase 2: Multi-Tenant Auth and Company Provisioning
Deliverables:
- `companies`, `users`, `sessions`, `audit_logs`
- Owner registration flow creates company + first admin
- Login, refresh, logout, current session APIs
- RBAC guards
- Tenant resolver middleware
- Session revocation and refresh rotation

Exit criteria:
- A new company can register and access only its own data
- Tenant leakage tests pass
- Role-based route protection works for company admin and master admin

#### Phase 3: Rooms, Messaging, and Realtime
Deliverables:
- Rooms CRUD and membership
- Message CRUD, threads, reactions
- Websocket gateway with Redis adapter
- Typing and presence events
- Read pagination and chronological loading

Exit criteria:
- Users in same company can create rooms and exchange realtime messages
- Cross-company room/message access is impossible
- Reconnect flow restores subscriptions correctly

#### Phase 4: File Sharing
Deliverables:
- MinIO-backed upload for small/normal files
- File validation, quotas, MIME restrictions
- File attachments in messages
- P2P transfer signaling for large files over WebRTC data channels
- Transfer state tracking for retry/failure reporting

Exit criteria:
- Small file upload/download works through storage service
- Large file direct transfer works between peers with fallback error handling
- File permissions follow room membership and tenant boundaries

#### Phase 5: Video Calling and Screen Sharing
Deliverables:
- Call lifecycle APIs
- WebRTC signaling over websocket
- STUN/TURN integration
- Call participant tracking
- Screen share start/stop state
- Active speaker and participant state contract

Exit criteria:
- One-to-one and room call join/leave works
- Screen share works in supported browsers
- Call teardown cleans server-side state reliably

#### Phase 6: Admin, Master Admin, Subscription
Deliverables:
- Company admin dashboard contracts
- Master admin contracts
- Plans, subscriptions, coupon application, redeem codes
- Usage enforcement hooks for plan limits
- Audit entries for billing/admin actions

Exit criteria:
- Company admin can manage users and rooms
- Master admin can view all companies and manage monetization objects
- Trial/pro/pro-enterprise logic enforced in API layer

#### Phase 7: Analytics and Background Jobs
Deliverables:
- Usage event model
- Daily aggregation jobs
- Tenant dashboard metrics
- Platform-level metrics for master admin
- Cleanup jobs for sessions, expired codes, stale transfer state

Exit criteria:
- Dashboard numbers come from repeatable aggregation jobs
- Analytics are scoped correctly by tenant and date range
- Jobs are idempotent

#### Phase 8: Web Application
Deliverables:
- Auth screens
- Tenant-aware app shell
- Dashboard
- Chat workspace
- Room management
- File attachments
- Video call UI
- Screen share UI
- Admin dashboard
- Master admin dashboard
- Liquid Glass design system tokens and core components

Exit criteria:
- Web app covers all backend MVP flows
- Responsive layouts for desktop and tablet
- Accessibility baseline: keyboard navigation, focus states, contrast review

#### Phase 9: Mobile Application
Deliverables:
- Expo scaffold
- Auth
- Chat list, room list, messaging
- Push-ready notification abstraction
- Read-only analytics/admin deferred unless required

Exit criteria:
- Mobile covers core messaging and call participation
- Shares same backend contracts without API divergence

#### Phase 10: Production Hardening and Deployment
Deliverables:
- Docker production images
- Nginx reverse proxy
- TLS termination plan
- Backup/restore runbook
- Monitoring/logging plan
- Rate limits and abuse controls
- Load/performance baseline

Exit criteria:
- Full environment deployable on single-node production
- Backup and restore tested
- Load test baseline documented for 5000-user target assumptions

### 5. Frontend Design System Implementation
Implement the Liquid Glass UI as a system, not page-by-page styling.

Core UI deliverables:
- Design tokens: color, opacity, blur, border glow, spacing, radius, motion
- Components: glass shell, card, button, modal, sidebar, topbar, input, chat bubble, file card, video tile
- Motion rules: subtle layered entrance, message fade, panel transitions, hover depth
- Layouts: auth, dashboard, chat workspace, call layout, admin tables, settings
- Theme constraints:
  - preserve liquid-glass direction
  - avoid unreadable transparency
  - keep dense collaboration screens functional before ornamental polish

UI acceptance criteria:
- Works on desktop and mobile breakpoints
- No core workflow blocked by animation or visual effects
- Performance remains acceptable on mid-range devices
- Reduced-motion fallback supported

### 6. Testing and Acceptance
Testing strategy by layer:
- Unit tests for services, guards, policies, utility logic
- Integration tests for controllers + DB + auth
- Websocket integration tests for message fanout and room membership
- End-to-end tests for auth, tenant isolation, messaging, files, calls, subscriptions
- Load tests for chat throughput, websocket concurrency, and storage operations

Must-pass scenarios:
- Company A cannot read/write Company B resources through REST or websocket
- Token refresh rotation invalidates replaced refresh tokens
- Removed room member loses message/file access immediately
- Edited/deleted messages propagate correctly to active clients
- File quota and type restrictions are enforced
- WebRTC signaling rejects unauthorized room participants
- Trial expiration and plan limit enforcement behave correctly
- Aggregation jobs do not double count when rerun
- Admin and master admin permissions are separated cleanly

### 7. Documentation and Governance
Required docs to maintain alongside implementation:
- `docs/architecture.md`
- `docs/api-contracts.md`
- `docs/realtime-events.md`
- `docs/database-schema.md`
- `docs/deployment-runbook.md`
- `docs/security-checklist.md`
- `docs/testing-strategy.md`

Working rules:
- Every phase ends with updated docs, migration notes, and acceptance checklist
- No feature is complete without API contract, auth rules, and test coverage definition
- Any schema or public contract change requires ADR or changelog entry

## Assumptions
- Delivery strategy is locked to **backend-first platform**
- OAuth, push notifications, desktop app, AI assistant, and offline mode are deferred beyond MVP
- Initial production deployment is single-region, self-hosted
- Multi-tenancy is logical isolation by `company_id`, not database-per-tenant
- Modular monolith is sufficient for v1; service extraction is postponed until proven by load or team scaling
- Mobile starts only after backend and web contracts stabilize
- When execution mode is enabled, save this plan as `Guide/implementation_master_plan_liquid_glass_platform.md`
