# Testing Strategy

## Current Baseline

- TypeScript compile checks for backend, frontend, and mobile packages

## Required Follow-Up

- backend unit tests for auth, companies, users
- integration tests for tenant isolation and refresh rotation
- websocket tests for room fanout
- end-to-end tests for auth and provisioning
- load tests for messaging and websocket concurrency
