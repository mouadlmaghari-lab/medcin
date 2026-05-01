# TabibCare — Project Tasks & Milestones

Medical Practice Management SaaS Platform
**Timeline:** 8 weeks to V1 launch
**Stack:** Laravel 11 · Next.js 16 + TailAdmin · React Native (Expo) + Gluestack

---

## Milestone 1: Foundation (Week 1–2)

> Goal: All infrastructure, auth, DB schema, and base UI scaffolding in place. Nothing can be built without this.

- [ ] **M1-T1** Set up Laravel 11 project with multi-tenancy middleware (tenant_id global scopes, tenant resolution from auth context)
- [ ] **M1-T2** Implement authentication system — Laravel Sanctum (web) + tymon/jwt-auth (mobile), bcrypt hashing, Spatie Permission roles (doctor, secretary, patient)
- [ ] **M1-T3** Create all database migrations (patients, appointments, consultations, certificates, payments, invoices, prescriptions, medications, expenses, reports, expertises, evolutions, files, doctor_patient_links, audit_logs, notifications)
- [ ] **M1-T4** Configure Backblaze B2 file storage with Spatie Medialibrary (pre-signed URLs, bucket structure /{tenant_id}/{patient_id}/{category}/{filename})
- [ ] **M1-T5** Set up Next.js 16 + TailAdmin with next-intl i18n (FR/AR/EN), RTL Tailwind plugin, and dual color themes (green for doctor, teal for assistant)
- [ ] **M1-T6** Set up React Native Expo SDK 52 + Gluestack UI v2 + NativeWind v4 mobile scaffold with React Navigation bottom tabs
- [ ] **M1-T7** Create base UI component library — shadcn/ui components, shared form patterns (React Hook Form + Zod), TanStack Query setup, Axios interceptors

---

## Milestone 2: Core Medical Modules (Week 3–4)

> Goal: The core clinical workflow is fully functional for doctors. A doctor can register patients, schedule appointments, run consultations, write prescriptions, and issue certificates.

- [ ] **M2-T1** Build patient management module — full CRUD, Meilisearch-powered search (name/phone/CIN), photo upload, DR-XXXX file number generation, physical vs. digital patient types
- [ ] **M2-T2** Build appointment system — FullCalendar v6 (day/week views, drag-and-drop), conflict detection, status workflow (En attente → Confirmé → En cours → Terminé/Annulé/Absent), walk-in support, configurable time slots
- [ ] **M2-T3** Build consultation management module — all 24 fields from legacy SQL schema (vitals, diabetology labs: HbA1c, glycemia, lipid panel, glucosuria, acetone), consultation history per patient
- [ ] **M2-T4** Set up PDF generation engine — Laravel DomPDF + Browsershot, cabinet branding (logo, header, doctor info), Arabic font support (Amiri/Cairo), A4 print-ready templates
- [ ] **M2-T5** Build prescription (ordonnance) management — medication list with dosage/frequency/duration, select from medication DB or free-text, reusable templates, PDF generation + patient mobile access
- [ ] **M2-T6** Build medical certificates module — certificate types (repos, aptitude, custom), auto-numbering, PDF with stamp area, certificate history per patient

---

## Milestone 3: Financial & Operations (Week 5–6)

> Goal: Full financial workflow and the assistant interface are operational. Payments, invoices, stock, and expenses are all tracked.

- [ ] **M3-T1** Build payment management module — migrate REGLEMENTS schema, payment methods (espèce/carte/assurance), partial payment tracking (reste à payer), daily cash register summary, printable receipts
- [ ] **M3-T2** Build invoice generation module — auto-numbered FACT-2026-XXXX, A4 and ticket print formats, HT/TVA/TTC tax calculation, PDF download, invoice status (Draft/Sent/Paid/Overdue)
- [ ] **M3-T3** Build medication management and stock module — searchable catalog, stock tracking per cabinet, low-stock alerts, expiration date monitoring, integration with ordonnance generation
- [ ] **M3-T4** Build cabinet expense tracking module — expense categories (rent, utilities, supplies, equipment), supplier management, monthly summaries, receipt/document attachment
- [ ] **M3-T5** Build assistant interface — teal/blue TailAdmin theme, navigation restricted to 4 modules (Rendez-vous, Patients, Règlements, Dépenses), simplified patient forms, quick payment entry workflow

---

## Milestone 4: Patient Mobile App (Week 7)

> Goal: The Espace Patient app is functional. Patients can register, link to doctors, book appointments, and access their documents.

- [ ] **M4-T1** Build patient registration and authentication — mobile sign-up/login with JWT, Expo Secure Store for tokens, profile management, 30-day refresh token
- [ ] **M4-T2** Implement doctor-patient linking — Scenario A (existing app user), Scenario B (invitation link/SMS + record claim by phone/CIN), Scenario C (physical-only, no app required)
- [ ] **M4-T3** Build appointment booking flow — multi-doctor view, React Native Calendars date picker, time slot selection, booking confirmation with Lottie animation, cancel/reschedule
- [ ] **M4-T4** Build document access and analyses upload — React Native PDF viewer for ordonnances and certificates, Expo Camera + Document Picker for lab analyses upload (PDF/JPEG/PNG, 10 MB max), per-doctor sharing permissions
- [ ] **M4-T5** Integrate OneSignal push notifications — all 10 notification events (appointment reminders 24h/1h, booking confirmed, prescription ready, certificate ready, new analyses, low stock, payment received)

---

## Milestone 5: Polish & Launch (Week 8)

> Goal: Platform is production-ready. Statistics, advanced modules, offline support, security hardening, and full test coverage complete.

- [ ] **M5-T1** Build analytics & statistics dashboard — Recharts charts (revenue, patient growth, top acts, appointment analytics), Excel export (Maatwebsite Laravel Excel), PDF export, date range filtering
- [ ] **M5-T2** Build medical reports, expertises, and patient evolution tracking — report/expertise CRUD with PDF export, expertise status tracking (En cours/Terminé), evolution timeline with HbA1c/weight/glucose trend charts
- [ ] **M5-T3** Implement offline PWA support — next-pwa + IndexedDB via idb-keyval, cache today's appointments and recent patients, offline consultation/payment queue via zustand, conflict resolution (server timestamp wins)
- [ ] **M5-T4** Set up audit logging and security hardening — Spatie Activitylog (5-year retention), optional 2FA TOTP for doctors, Moroccan law compliance (Law 09-08 / Law 05-20), data export/deletion (right to be forgotten)
- [ ] **M5-T5** Run full test suite and performance optimization — Pest (Laravel backend), Vitest (Next.js), Meilisearch tuning, Redis caching, Sentry error tracking setup, CI/CD via GitHub Actions
- [ ] **M5-T6** Deploy to production and go live — Hostinger VPS setup, Cloudflare CDN, Let's Encrypt SSL, Laravel Horizon for queue monitoring, database backups (Laravel Backup), go-live checklist

---

## Summary

| Milestone | Weeks | Tasks | Focus |
|---|---|---|---|
| M1: Foundation | 1–2 | 7 | Infrastructure, auth, DB, base UI |
| M2: Core Medical | 3–4 | 6 | Patients, appointments, consultations, PDF, prescriptions, certificates |
| M3: Financial & Ops | 5–6 | 5 | Payments, invoices, medications, expenses, assistant UI |
| M4: Mobile App | 7 | 5 | Patient app, linking, booking, documents, notifications |
| M5: Polish & Launch | 8 | 6 | Stats, reports, offline, security, testing, deployment |
| **Total** | **8 weeks** | **29 tasks** | |
