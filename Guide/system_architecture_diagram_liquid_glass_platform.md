# System Architecture Diagram
## Liquid Glass Collaboration Platform

---

# High Level Architecture

```mermaid
graph TD

Users[Users - Web & Mobile Apps]

Users --> CDN

CDN[CDN / Static Assets]

CDN --> Nginx

Nginx[NGINX Reverse Proxy]

Nginx --> Frontend

Frontend[Next.js Frontend]

Frontend --> API

API[API Gateway - NestJS]

API --> AuthService
API --> UserService
API --> ChatService
API --> RoomService
API --> FileService
API --> VideoService
API --> AnalyticsService
API --> SubscriptionService

AuthService --> DB
UserService --> DB
ChatService --> DB
RoomService --> DB
AnalyticsService --> DB
SubscriptionService --> DB

ChatService --> Redis
VideoService --> Redis

FileService --> MinIO

VideoService --> WebRTC

DB[(PostgreSQL Database)]
Redis[(Redis Cache / PubSub)]
MinIO[(MinIO Object Storage)]
WebRTC[(WebRTC P2P Network)]

```

---

# Detailed Microservices Architecture

```mermaid
graph LR

Client --> Gateway

Gateway --> Auth
Gateway --> Users
Gateway --> Chat
Gateway --> Rooms
Gateway --> Files
Gateway --> Video
Gateway --> Analytics
Gateway --> Subscription

Auth --> PostgreSQL
Users --> PostgreSQL
Chat --> PostgreSQL
Rooms --> PostgreSQL
Analytics --> PostgreSQL
Subscription --> PostgreSQL

Chat --> Redis
Video --> Redis

Files --> MinIO

Video --> STUN
Video --> TURN

PostgreSQL[(PostgreSQL)]
Redis[(Redis)]
MinIO[(MinIO)]
STUN[(STUN Server)]
TURN[(TURN Server)]

```

---

# Realtime Messaging Architecture

```mermaid
sequenceDiagram

UserA->>Frontend: Send Message
Frontend->>WebSocket: Emit Message
WebSocket->>Chat Service: Receive Message
Chat Service->>Redis: Publish Message
Redis->>Chat Service: Broadcast
Chat Service->>UserB: Send Message

```

---

# Video Calling Architecture

```mermaid
graph TD

User1 --> SignalingServer
User2 --> SignalingServer

SignalingServer --> STUN
SignalingServer --> TURN

User1 --> WebRTC
User2 --> WebRTC

WebRTC[Peer to Peer Video]

```

---

# Large File P2P Sharing

```mermaid
graph LR

UserA --> SignalingServer
UserB --> SignalingServer

UserA --> WebRTC
UserB --> WebRTC

WebRTC --> DirectTransfer

DirectTransfer[Direct Peer File Transfer]

```

---

# Deployment Architecture

```mermaid
graph TD

Internet --> LoadBalancer

LoadBalancer --> Server1
LoadBalancer --> Server2

Server1 --> Backend
Server2 --> Backend

Backend --> Database
Backend --> Redis
Backend --> MinIO

Database[(PostgreSQL)]
Redis[(Redis)]
MinIO[(MinIO)]

```

---

# Recommended Server Setup (5000 Users)

Primary Server

- 8 CPU
- 16GB RAM
- 200GB SSD

Services:

- NGINX
- Backend
- Redis
- PostgreSQL
- MinIO

---

# Future Scaling Architecture

```mermaid
graph TD

Users --> LoadBalancer

LoadBalancer --> App1
LoadBalancer --> App2
LoadBalancer --> App3

App1 --> RedisCluster
App2 --> RedisCluster
App3 --> RedisCluster

App1 --> DBCluster
App2 --> DBCluster
App3 --> DBCluster

RedisCluster[(Redis Cluster)]
DBCluster[(PostgreSQL Cluster)]

```

---

# Final Architecture Summary

Frontend

- Next.js
- React

Backend

- NestJS
- Node.js

Database

- PostgreSQL

Realtime

- WebSocket
- Redis

Video Calling

- WebRTC

File Storage

- MinIO

Deployment

- Docker
- Nginx

---

End of Architecture Document

