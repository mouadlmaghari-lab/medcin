# TabibCare — Claude Project Context

## Product
**TabibCare** is a medical practice management SaaS for solo practitioners in Morocco.
It migrates a validated desktop app to a modern web + mobile platform.

## Three Platforms
| Platform | Stack | Slash Command |
|---|---|---|
| Backend API | Laravel 11 · PHP 8.3 · MySQL 8 · Redis | `/backend` |
| Web Frontend | Next.js 16 · TailAdmin · shadcn/ui · Tailwind CSS | `/frontend` |
| Patient Mobile | React Native (Expo SDK 52) · Gluestack UI v2 · NativeWind | `/mobile` |

> Always activate the relevant platform agent before starting work on a module.

## Three User Roles
- **Doctor** — Full access, green navbar, web only
- **Assistant (Aide-Médecin)** — 4 modules only (Rendez-vous, Patients, Règlements, Dépenses), teal navbar
- **Patient** — Mobile app only (Espace Patient)

## Architecture Rules (Non-Negotiable)
1. **Multi-tenancy** — Every tenant-scoped table has `tenant_id`. Laravel Global Scopes apply it automatically. Never query without it.
2. **Auth** — Laravel Sanctum for web tokens, tymon/jwt-auth for mobile. Passwords: bcrypt (cost 12). Never store plaintext.
3. **File storage** — All files go to Backblaze B2 via Spatie Medialibrary. Always use pre-signed URLs (15-min expiry). Never expose bucket directly.
4. **i18n** — French (default), Arabic (RTL), English. Every user-facing string must go through the translation layer. Arabic requires RTL layout flip.
5. **PDF generation** — DomPDF for simple PDFs, Browsershot for complex. Always include cabinet branding (logo, doctor name, INPE).
6. **Roles** — Spatie Permission package. Never hardcode role checks — use `$user->hasRole()` / `$user->can()`.
7. **Moroccan compliance** — Law 09-08 (consent, data minimization) + Law 05-20 (security measures). Patient consent is recorded on doctor-patient link creation.
8. **Frontend Validation parity** — Every form must implement client-side validation (React Hook Form + Zod) **before** submitting to the API. Zod schemas must mirror the backend `FormRequest` rules exactly: same field names, same required/optional status, same numeric constraints (min/max/maxLength). The backend must expose a `GET /<resource>/validation-rules` endpoint for any form with ≥8 fields; this endpoint returns structured constraint metadata that frontend engineers MUST consult when writing Zod schemas. Frontend field names must match backend field names 1:1 — no aliasing, no renaming. Any drift between client and server rules must be flagged and resolved before merge.

## Issue Tracking (bd / beads)
```bash
bd ready                          # See unblocked work
bd list --label backend           # Backend tasks only
bd list --label frontend          # Frontend tasks only
bd list --label mobile            # Mobile tasks only
bd show <id>                      # Full task details
bd update <id> --status in_progress
bd close <id>                     # Mark done
bd sync                           # Sync at session end
```

## Key Libraries Quick Reference
- **Forms**: React Hook Form v7 + Zod v3 (same schemas on web and mobile where possible)
- **Data fetching**: TanStack Query v5 (same patterns on web and mobile)
- **Search**: Laravel Scout + Meilisearch (patients by name/phone/CIN)
- **Queue**: Redis + Laravel Horizon
- **Audit**: Spatie Activitylog (5-year retention, log all medical record access)
- **Notifications**: OneSignal (push to patient and doctor)
- **Testing**: Pest (Laravel), Vitest (Next.js), Jest (React Native)
- **CI/CD**: GitHub Actions → Hostinger VPS
