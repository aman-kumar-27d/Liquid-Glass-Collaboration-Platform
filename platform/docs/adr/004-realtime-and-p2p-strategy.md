# ADR 004: Realtime and P2P Strategy

## Decision

Use Socket.IO for realtime orchestration, Redis for fanout, and WebRTC for call and large-file peer transfers.

## Reasoning

- Socket.IO simplifies auth and room lifecycle events
- Redis enables later horizontal scale
- WebRTC avoids server relay for large direct transfers where possible
