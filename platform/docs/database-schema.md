# Database Schema

## Implemented Entities

- `companies`
- `users`
- `sessions`
- `audit_logs`
- `rooms`
- `room_members`
- `messages`
- `message_reactions`
- `files`
- `video_calls`
- `call_participants`
- `screen_shares`

## Current Rules

- UUID primary keys
- `created_at`, `updated_at`, `deleted_at` on base entity
- unique `users(company_id, email)`
- indexed `users(company_id, role, is_active)`
- session refresh tokens stored hashed
- files can be attached to messages through `files.message_id`
- active call lifecycle is modeled through `video_calls.ended_at`
- screen-sharing state is modeled separately from call participation

## Deferred Entities

- file_transfers
- subscriptions
- coupons
- redeem_codes
- analytics snapshots
- notifications
