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

## Current Rules

- UUID primary keys
- `created_at`, `updated_at`, `deleted_at` on base entity
- unique `users(company_id, email)`
- indexed `users(company_id, role, is_active)`
- session refresh tokens stored hashed
- files can be attached to messages through `files.message_id`

## Deferred Entities

- file_transfers
- video_calls
- screen_shares
- subscriptions
- coupons
- redeem_codes
- analytics snapshots
- notifications
