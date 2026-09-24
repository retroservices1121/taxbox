# TaxBox build status

## Implemented

- [x] Separate TaxBox repository
- [x] Next.js 15 / React 19 / TypeScript foundation
- [x] Tailwind foundation
- [x] Public product landing screen
- [x] Firm dashboard prototype designed for 1,000+ TaxBoxes
- [x] Mobile client TaxBox prototype
- [x] Individual and business pricing model
- [x] TaxBox lifecycle/status model
- [x] Individual organizer-to-checklist logic
- [x] Business organizer-to-checklist logic
- [x] Document intelligence provider interface
- [x] Mock classification provider
- [x] PostgreSQL / Drizzle schema foundation
- [x] Firms and staff schema
- [x] Client schema
- [x] Annual workspace schema
- [x] Checklist schema
- [x] Documents schema
- [x] Invitation schema
- [x] Document-request schema
- [x] Audit-event schema
- [x] Railway Bucket storage adapter
- [x] Pre-storage document encryption
- [x] Per-firm envelope-key model
- [x] Local KMS development provider
- [x] Vault Transit production KMS provider
- [x] Upload validation and processing service
- [x] CI build/typecheck workflow

## Remaining core V1

- [ ] Port/adapt hardened staff authentication + TOTP from Empleados
- [ ] Add database RLS and scoped data-access layer
- [ ] Add staff dashboard backed by live database queries
- [ ] CSV import and bulk activation
- [ ] Firm/client invitation flow
- [ ] Organizer persistence and client sessions
- [ ] Live checklist persistence
- [ ] Document upload API and authenticated document streaming
- [ ] Production AI classifier implementation
- [ ] Automatic checklist matching
- [ ] Duplicate and wrong-year detection
- [ ] Request-document action and email delivery
- [ ] Reminder jobs
- [ ] Staff assignment/bulk actions
- [ ] Secure organized export
- [ ] Activation/billing report
- [ ] Retention/deletion jobs
- [ ] Security/isolation test suite
- [ ] Production deployment configuration
- [ ] Firm branding controls

## Security rule

Do not put real taxpayer data into TaxBox until the RLS/scoped DAL, hardened authentication, audit enforcement, production key custody, and security tests are complete.
