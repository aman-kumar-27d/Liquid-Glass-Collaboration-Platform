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
- future modules reserved for rooms, messages, files, video, screen, analytics, subscriptions, admin, and master admin

## Tenant Strategy

- Logical multi-tenancy using `company_id`
- Every tenant-owned table must include `company_id`
- Authenticated requests derive tenant context from JWT claims
- Cross-tenant reads and writes are prohibited at service and query level
