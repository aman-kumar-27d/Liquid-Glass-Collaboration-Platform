# API Contracts

## Response Envelope

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": null
}
```

## Implemented Endpoints

- `GET /api/v1/health/liveness`
- `GET /api/v1/health/readiness`
- `POST /api/v1/auth/register-owner`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/companies`
- `GET /api/v1/companies`
- `GET /api/v1/companies/:id`
- `PATCH /api/v1/companies/:id`
- `GET /api/v1/users`
- `POST /api/v1/rooms`
- `GET /api/v1/rooms`
- `GET /api/v1/rooms/:id`
- `POST /api/v1/rooms/:id/join`
- `POST /api/v1/rooms/:id/leave`
- `POST /api/v1/rooms/:id/members`
- `DELETE /api/v1/rooms/:id/members/:userId`
- `GET /api/v1/messages?roomId=:roomId`
- `POST /api/v1/messages`
- `PATCH /api/v1/messages/:id`
- `DELETE /api/v1/messages/:id`
- `POST /api/v1/messages/:id/reactions`
- `POST /api/v1/files/upload`
- `GET /api/v1/files/:id`
- `GET /api/v1/files/:id/download`
- `POST /api/v1/calls/start`
- `POST /api/v1/calls/join`
- `POST /api/v1/calls/:id/leave`
- `POST /api/v1/calls/:id/end`
- `GET /api/v1/calls/rooms/:roomId/active`
- `POST /api/v1/screen-share/start`
- `POST /api/v1/screen-share/:callId/stop`
- `GET /api/v1/subscriptions/plans`
- `GET /api/v1/subscriptions/current`
- `POST /api/v1/subscriptions/change-plan`
- `POST /api/v1/subscriptions/apply-coupon`
- `POST /api/v1/subscriptions/redeem-code`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id`
- `GET /api/v1/admin/rooms`
- `DELETE /api/v1/admin/rooms/:id`
- `GET /api/v1/master/companies`
- `GET /api/v1/master/subscriptions`
- `GET /api/v1/master/coupons`
- `POST /api/v1/master/coupons`
- `GET /api/v1/master/redeem-codes`
- `POST /api/v1/master/redeem-codes`

## Next Endpoints

- P2P large file transfer signaling
- analytics and jobs
- notification delivery
