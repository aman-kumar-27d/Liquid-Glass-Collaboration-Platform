# Backend Architecture Folder Structure
## Liquid Glass Collaboration Platform (Enterprise Level)

---

# Architecture Overview

This backend follows **Enterprise Modular Architecture** using:

- NestJS
- TypeScript
- Microservice Ready Structure
- Multi-tenant Support
- Scalable for 5000+ users

Architecture Pattern:

- Modular Architecture
- Clean Architecture
- Domain Driven Design (DDD)

---

# Root Folder Structure

```
backend/
│
├── apps/
├── config/
├── database/
├── modules/
├── common/
├── shared/
├── gateway/
├── jobs/
├── logs/
├── scripts/
├── test/
│
├── .env
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

# Apps Folder

```
apps/
 ├── api
 ├── worker
 └── websocket
```

## API

Main REST API server

## Worker

Background jobs

## WebSocket

Realtime server

---

# Modules Folder

Core Business Modules

```
modules/

 ├── auth/
 ├── users/
 ├── companies/
 ├── rooms/
 ├── messages/
 ├── files/
 ├── video/
 ├── screen/
 ├── notifications/
 ├── analytics/
 ├── subscription/
 ├── coupons/
 ├── redeem/
 ├── admin/
 ├── master/

```

---

# Example Module Structure

```
users/
 ├── controllers/
 ├── services/
 ├── repositories/
 ├── dto/
 ├── entities/
 ├── interfaces/
 ├── guards/
 ├── decorators/
 └── users.module.ts
```

---

# Auth Module

```
auth/
 ├── controllers/
 ├── services/
 ├── guards/
 ├── strategies/
 ├── dto/
 ├── entities/
 ├── decorators/
 └── auth.module.ts
```

---

# Chat Module

```
messages/
 ├── controllers/
 ├── services/
 ├── gateways/
 ├── dto/
 ├── entities/
 └── messages.module.ts
```

---

# Video Module

```
video/
 ├── controllers/
 ├── services/
 ├── gateways/
 ├── webrtc/
 └── video.module.ts
```

---

# Screen Share Module

```
screen/
 ├── controllers/
 ├── services/
 ├── gateways/
 └── screen.module.ts
```

---

# File Module

```
files/
 ├── controllers/
 ├── services/
 ├── storage/
 ├── dto/
 └── files.module.ts
```

---

# Common Folder

Shared utilities

```
common/

 ├── guards/
 ├── filters/
 ├── interceptors/
 ├── decorators/
 ├── middleware/
 ├── pipes/
 ├── constants/
 ├── enums/
 ├── utils/

```

---

# Shared Folder

Reusable logic

```
shared/

 ├── logger/
 ├── cache/
 ├── mail/
 ├── storage/
 ├── websocket/
 ├── validation/

```

---

# Config Folder

```
config/

 ├── database.config.ts
 ├── redis.config.ts
 ├── jwt.config.ts
 ├── storage.config.ts
 ├── app.config.ts

```

---

# Database Folder

```
database/

 ├── migrations/
 ├── seeds/
 ├── entities/
 ├── repositories/

```

---

# Gateway Folder

WebSocket gateway

```
gateway/

 ├── chat.gateway.ts
 ├── video.gateway.ts
 ├── screen.gateway.ts

```

---

# Jobs Folder

Background workers

```
jobs/

 ├── email.job.ts
 ├── analytics.job.ts
 ├── cleanup.job.ts

```

---

# Logs Folder

```
logs/

 ├── error.log
 ├── access.log

```

---

# Scripts Folder

```
scripts/

 ├── create-admin.ts
 ├── seed-db.ts

```

---

# Test Folder

```
test/

 ├── unit/
 ├── integration/

```

---

# Module Communication Flow

```
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

---

# Microservice Ready Structure (Future)

Possible split later:

- Auth Service
- Chat Service
- Video Service
- File Service

---

# Environment Files

```
.env
.env.development
.env.production
```

---

# Security Layer

Security Implementation

- Guards
- Middleware
- Rate limiter
- JWT auth

---

# Final Enterprise Features

Supports:

- Multi Tenant
- Realtime Messaging
- Video Calling
- Screen Sharing
- File Sharing
- Analytics
- Subscription

---

# Final Structure Summary

This structure is:

- Enterprise Ready
- Scalable
- Maintainable
- Modular

---

End of Backend Architecture

