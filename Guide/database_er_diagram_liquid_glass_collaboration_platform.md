# Database ER Diagram
## Liquid Glass Collaboration Platform

---

# Overview

This database is designed for a multi-tenant collaboration platform supporting:

- Multi-company workspaces
- Real-time messaging
- Video calling
- Screen sharing
- File sharing
- Subscription system
- Admin roles
- Analytics

---

# Main ER Diagram

```mermaid
erDiagram

COMPANIES ||--o{ USERS : has
COMPANIES ||--o{ ROOMS : owns
COMPANIES ||--o{ SUBSCRIPTIONS : has
COMPANIES ||--o{ ANALYTICS : tracks

USERS ||--o{ ROOM_MEMBERS : joins
ROOMS ||--o{ ROOM_MEMBERS : contains

ROOMS ||--o{ MESSAGES : contains
USERS ||--o{ MESSAGES : sends

MESSAGES ||--o{ FILES : attaches

ROOMS ||--o{ VIDEO_CALLS : hosts
VIDEO_CALLS ||--o{ CALL_PARTICIPANTS : contains

VIDEO_CALLS ||--o{ SCREEN_SHARES : has

COMPANIES ||--o{ COUPONS : uses
COMPANIES ||--o{ REDEEM_CODES : uses

COMPANIES {
  uuid id PK
  string name
  string domain
  string plan
  timestamp created_at
}

USERS {
  uuid id PK
  uuid company_id FK
  string name
  string email
  string password
  string role
  string avatar
  boolean is_active
  timestamp created_at
}

ROOMS {
  uuid id PK
  uuid company_id FK
  string name
  string type
  uuid created_by
  timestamp created_at
}

ROOM_MEMBERS {
  uuid id PK
  uuid room_id FK
  uuid user_id FK
  string role
  timestamp joined_at
}

MESSAGES {
  uuid id PK
  uuid room_id FK
  uuid sender_id FK
  text content
  string type
  timestamp created_at
}

FILES {
  uuid id PK
  uuid message_id FK
  string file_name
  string file_url
  int file_size
  string file_type
  timestamp created_at
}

VIDEO_CALLS {
  uuid id PK
  uuid room_id FK
  uuid started_by
  timestamp started_at
  timestamp ended_at
}

CALL_PARTICIPANTS {
  uuid id PK
  uuid call_id FK
  uuid user_id FK
  timestamp joined_at
}

SCREEN_SHARES {
  uuid id PK
  uuid call_id FK
  uuid user_id FK
  timestamp started_at
  timestamp ended_at
}

SUBSCRIPTIONS {
  uuid id PK
  uuid company_id FK
  string plan
  timestamp start_date
  timestamp end_date
}

REDEEM_CODES {
  uuid id PK
  string code
  string plan
  int usage_limit
  timestamp expiry
}

COUPONS {
  uuid id PK
  string code
  int discount
  timestamp expiry
}

ANALYTICS {
  uuid id PK
  uuid company_id FK
  int active_users
  int messages_count
  int storage_used
  timestamp recorded_at
}

```

---

# Multi Tenant Structure

Each Company has:

- Users
- Rooms
- Messages
- Analytics
- Subscription

Data Isolation handled by:

company_id

---

# Role System

Roles Supported:

- Master Admin
- Company Admin
- Moderator
- User

---

# Message Types

Supported Message Types:

- text
- image
- file
- code
- video
- audio
- system

---

# Room Types

Supported Room Types:

- Direct Message
- Group Chat
- Channel

---

# File Storage Types

Storage Methods:

- Server Upload (Small Files)
- P2P WebRTC (Large Files)

---

# Performance Indexing

Recommended Indexes:

USERS
- company_id
- email

MESSAGES
- room_id
- created_at

ROOM_MEMBERS
- user_id
- room_id

FILES
- message_id

VIDEO_CALLS
- room_id

---

# Future Extensions

Possible Future Tables:

- Notifications
- AI Messages
- Audit Logs
- Activity Logs

---

# Final Notes

This ER design supports:

- Multi Company
- Real time chat
- Video calling
- Screen sharing
- File sharing
- Analytics
- Subscription system

This schema is scalable for 5000+ users.

---

End of Database ER Diagram
