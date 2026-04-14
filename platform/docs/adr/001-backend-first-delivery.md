# ADR 001: Backend-First Delivery

## Decision

Deliver the backend platform before full web and mobile feature implementation.

## Reasoning

- Tenant isolation and auth contracts are the highest-risk foundation
- Web and mobile should consume a stable shared API
- Realtime and WebRTC flows benefit from backend-first validation
