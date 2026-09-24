# TaxBox

TaxBox is a secure tax-document intake platform for accounting and tax-preparation firms.

## Product model

- Accounting firms invite clients.
- Individual TaxBox: $10 per tax season.
- Business TaxBox: $20 per tax season.
- One TaxBox = one client + one tax year.
- TaxBox does not prepare or file tax returns.
- TaxBox collects, organizes, tracks, requests, and exports documents for the preparer.

## Core workflow

1. Firm imports or creates clients.
2. Firm activates a TaxBox for a client and tax year.
3. Client receives an invitation.
4. Client completes a short organizer/questionnaire.
5. TaxBox generates a checklist.
6. Client uploads documents.
7. Document intelligence classifies and matches uploads.
8. Missing items remain visible.
9. Staff can request specific items.
10. Workspace reaches Ready for Preparation.
11. Firm exports an organized tax package.

## Architecture

TaxBox is a separate application from Empleados.us. It may reuse proven architectural patterns but must use its own database, Railway Bucket, keys, deployment, domain, and secrets.

Stack:
- Next.js 15 / React 19 / TypeScript
- PostgreSQL
- Drizzle ORM
- Railway deployment
- Railway Bucket object storage through its S3-compatible API
- Server-side sessions and MFA for firm staff
- Tenant isolation and audit logging
- Encrypted document storage
- AI document classification behind a provider interface

## Status

Initial TaxBox foundation and domain model are being implemented.
