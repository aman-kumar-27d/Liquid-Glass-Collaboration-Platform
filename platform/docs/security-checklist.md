# Security Checklist

- JWT access and refresh secrets must be rotated out of defaults before deployment
- Refresh tokens are hashed in persistence
- Company-scoped endpoints must always filter on `company_id`
- Admin and master admin roles must be enforced with explicit guards
- File upload MIME, size, and malware checks are required before production
- TURN static secret must be replaced before public deployment
- Audit logs are mandatory for auth, admin, billing, and destructive actions
