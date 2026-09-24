# TaxBox MVP Specification

## Product boundary

TaxBox is the intake layer before tax preparation. It does not calculate tax, prepare returns, transmit returns, perform bookkeeping, or replace professional tax software.

## Users

### Platform admin
Creates and supports accounting firms. Has no ordinary need to read taxpayer document contents.

### Firm admin
Manages staff, branding, imports, pricing records, clients, workspaces, reminders, exports, and security settings.

### Firm staff / preparer
Works assigned TaxBoxes, reviews documents, requests missing items, changes workflow status, and exports complete packages.

### Taxpayer / business client
Enters through a firm invitation and only sees their own TaxBox.

## Pricing

- Individual: $10 per activated tax year
- Business: $20 per activated tax year
- No charge for a client record until a TaxBox is activated
- V1 may invoice firms from activation counts rather than collect end-client payment

## TaxBox lifecycle

NOT_STARTED → COLLECTING → MISSING_ITEMS → READY_FOR_PREPARATION → IN_PREPARATION → ADDITIONAL_INFO_REQUESTED → READY_TO_FILE → FILED → ARCHIVED

## Firm dashboard requirements

Designed for 1,000+ workspaces:
- global search
- filter by type, status, tax year, assigned staff, missing count
- bulk invitation
- bulk reminder
- CSV import
- staff assignment
- last activity
- checklist completion count
- activation counts and seasonal billing summary

## Client requirements

Mobile-first:
- branded firm invitation
- organizer/questionnaire
- generated checklist
- upload PDF/image
- see requested/missing/received items
- receive document requests and reminders
- no independent public signup in V1

## Document intelligence

On upload:
1. Validate file type/size.
2. Malware scanning hook.
3. Encrypt before object storage.
4. Classify document type.
5. Detect likely tax year.
6. Extract issuer and useful indexing metadata.
7. Generate readable display name.
8. Match to checklist item.
9. Flag wrong-year, ambiguous, duplicate, or low-confidence documents for human review.
10. Never independently determine tax treatment.

## Storage

Production documents live in a dedicated TaxBox Railway Bucket. Railway exposes an S3-compatible API, but TaxBox must use a separate bucket and credentials from Empleados.

Documents should be encrypted before object upload so the bucket stores ciphertext.

## Security baseline

Carry forward proven patterns from Empleados where appropriate:
- separate admin and application DB roles
- Postgres tenant isolation / RLS
- scoped data access layer
- server-side revocable sessions
- mandatory MFA for staff
- per-tenant encryption keys
- audit events for document upload/view/delete/export and security-sensitive actions
- no public document URLs
- separate TaxBox keys, secrets, database, bucket, and deployment
- retention and deletion jobs
- rate limiting for authentication
- secure invitation tokens

## V1 bulk operations

Required because first design partner has roughly 945+ known clients:
- CSV client import
- bulk activation
- bulk invite/resend
- bulk status filter
- bulk staff assignment
- bulk reminder
- export activation report for invoicing
