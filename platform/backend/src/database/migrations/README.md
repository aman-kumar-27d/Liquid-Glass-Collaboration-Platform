# Migrations

Store TypeORM migrations for schema delivery here.

Initial implementation intentionally ships without generated migrations because the repository is still at foundation stage. The next backend change should add the first migration set for:

- `companies`
- `users`
- `sessions`
- `audit_logs`
 
Implemented:

- `1713112200000-InitialFoundation.ts` for the current Phase 0-3 schema baseline
- `1713115800000-AddFilesPhase4.ts` for the Phase 4 file metadata baseline
