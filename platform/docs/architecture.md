# Architecture

## Chosen Shape

- Modular monolith backend with explicit domain boundaries
- Next.js web app consuming `/api/v1` contracts
- Expo mobile app deferred beyond scaffold
- PostgreSQL, Redis, MinIO, and Coturn as local infrastructure primitives

## Backend Boundaries

- `auth`: authentication, session lifecycle, audit logging for auth events
- `companies`: tenant records and company profile
- `users`: tenant-scoped user listing and lifecycle
- `rooms`: room lifecycle and membership
- `messages`: room messages, updates, deletes, reactions, and websocket broadcast baseline
- `files`: local or MinIO-backed upload/download metadata and storage abstraction baseline
- `video`: call lifecycle, participants, and WebRTC signaling baseline
- `screen`: active screen-share state over call lifecycle
- `subscription`: plans, current subscription, coupon and redeem-code application
- `admin`: company-admin user and room management surfaces
- `master`: platform-wide company, subscription, coupon, and redeem-code management
- `analytics`: reserved for usage aggregation and reporting jobs

## Web Surfaces

- `/`: project landing page
- `/auth`: live login and owner-registration shell using local token storage for temporary development
- `/workspace`: tenant overview dashboard with live room and subscription reads
- `/workspace/chat`: room and message workspace with room creation, staged file uploads, per-file upload progress, staged attachment removal, authenticated downloads, websocket room join, live message fanout, presence, and typing state
- `/workspace/calls`: active-call inspection, call start/join/leave actions, local media capture, mic/camera toggles, reconnect-aware signaling recovery, WebRTC signaling, participant media tiles, screen-share start/stop, and websocket call-room synchronization
- `/workspace/admin`: tenant admin reads with user activation toggles
- `/workspace/billing`: subscription reads with plan change, coupon, and redeem-code actions

## Tenant Strategy

- Logical multi-tenancy using `company_id`
- Every tenant-owned table must include `company_id`
- Authenticated requests derive tenant context from JWT claims
- Cross-tenant reads and writes are prohibited at service and query level
