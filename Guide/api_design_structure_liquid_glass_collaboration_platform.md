# API Design Structure
## Liquid Glass Collaboration Platform

---

# API Design Principles

Architecture Style:

- REST API (Primary)
- WebSocket (Realtime)
- WebRTC (Video & P2P)

Standards:

- RESTful endpoints
- JWT Authentication
- Versioned API

Base URL:

```
/api/v1/
```

---

# Authentication APIs

## Register

POST /api/v1/auth/register

Body:

```
{
  "name": "",
  "email": "",
  "password": "",
  "company_name": ""
}
```

---

## Login

POST /api/v1/auth/login

```
{
  "email": "",
  "password": ""
}
```

---

## Refresh Token

POST /api/v1/auth/refresh

---

## Logout

POST /api/v1/auth/logout

---

# User APIs

## Get Users

GET /api/v1/users

---

## Get User

GET /api/v1/users/:id

---

## Update User

PUT /api/v1/users/:id

---

## Delete User

DELETE /api/v1/users/:id

---

# Company APIs

## Get Companies (Master Admin)

GET /api/v1/companies

---

## Create Company

POST /api/v1/companies

---

## Update Company

PUT /api/v1/companies/:id

---

# Room APIs

## Create Room

POST /api/v1/rooms

---

## Get Rooms

GET /api/v1/rooms

---

## Join Room

POST /api/v1/rooms/:id/join

---

## Leave Room

POST /api/v1/rooms/:id/leave

---

# Messaging APIs

## Send Message

POST /api/v1/messages

---

## Get Messages

GET /api/v1/messages/:room_id

---

## Delete Message

DELETE /api/v1/messages/:id

---

# File APIs

## Upload File

POST /api/v1/files/upload

---

## Get File

GET /api/v1/files/:id

---

# Video Call APIs

## Start Call

POST /api/v1/video/start

---

## Join Call

POST /api/v1/video/join

---

## End Call

POST /api/v1/video/end

---

# Screen Sharing APIs

## Start Screen Share

POST /api/v1/screen/start

---

## Stop Screen Share

POST /api/v1/screen/stop

---

# Subscription APIs

## Get Plans

GET /api/v1/subscription/plans

---

## Subscribe

POST /api/v1/subscription/subscribe

---

# Coupon APIs

## Apply Coupon

POST /api/v1/coupons/apply

---

# Redeem Code APIs

## Redeem

POST /api/v1/redeem

---

# Analytics APIs

## Dashboard Stats

GET /api/v1/analytics/dashboard

---

## User Analytics

GET /api/v1/analytics/users

---

# Admin APIs

## Manage Users

GET /api/v1/admin/users

---

## Manage Rooms

GET /api/v1/admin/rooms

---

# Master Admin APIs

## All Companies

GET /api/v1/master/companies

---

## Platform Analytics

GET /api/v1/master/analytics

---

# WebSocket Events

Connection:

```
/ws
```

Events:

- connect
- disconnect
- message
- typing
- join_room
- leave_room

---

# Video Call WebRTC Events

- offer
- answer
- candidate
- join_call
- leave_call

---

# Error Response Format

```
{
  "status": "error",
  "message": "Error message"
}
```

---

# Success Response Format

```
{
  "status": "success",
  "data": {}
}
```

---

# API Security

Security:

- JWT Auth
- Rate limiting
- Role based access

---

# Versioning Strategy

Version:

```
/api/v1
```

Future:

```
/api/v2
```

---

# API Folder Structure

```
auth/
users/
companies/
rooms/
messages/
files/
video/
screen/
analytics/
subscription/
admin/
master/
```

---

# Final Notes

This API structure supports:

- Multi company
- Realtime chat
- Video calling
- Screen sharing
- File sharing
- Admin control

---

End of API Design
