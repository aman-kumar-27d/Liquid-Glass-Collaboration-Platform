# Testing Strategy

## Current Baseline

- backend TypeScript compile and lint checks
- frontend production build on Next.js 16 with typed routes enabled
- mobile TypeScript compile baseline

## Required Follow-Up

- backend unit tests for auth, companies, users
- integration tests for tenant isolation and refresh rotation
- websocket tests for room fanout
- end-to-end tests for auth, provisioning, rooms, messaging, files, and billing flows
- load tests for messaging and websocket concurrency
