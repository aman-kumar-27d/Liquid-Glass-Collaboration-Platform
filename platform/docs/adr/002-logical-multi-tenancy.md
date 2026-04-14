# ADR 002: Logical Multi-Tenancy

## Decision

Use logical multi-tenancy with `company_id` rather than database-per-tenant for v1.

## Reasoning

- Simpler operations for an early-stage self-hosted product
- Adequate for the initial 5000-user target
- Keeps analytics and admin queries manageable
