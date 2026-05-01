# TabibCare — Doctor Space UI/UX Audit Report

> Generated: 2026-03-01
> Scope: 29 pages across 12 doctor modules + shared infrastructure
> Method: 6 parallel source code audit squads

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Global Cross-Cutting Issues](#global-cross-cutting-issues)
3. [Squad A — Dashboard + Patients](#squad-a--dashboard--patients)
4. [Squad B — Appointments + Consultations](#squad-b--appointments--consultations)
5. [Squad C — Prescriptions + Certificates](#squad-c--prescriptions--certificates)
6. [Squad D — Payments + Invoices + Expenses](#squad-d--payments--invoices--expenses)
7. [Squad E — Medications + Documents](#squad-e--medications--documents)
8. [Squad F — Reports + Layout + Sidebar + Shared Components](#squad-f--reports--layout--sidebar--shared-components)
9. [Priority Matrix](#priority-matrix)

---

## Executive Summary

### Overall Score: Needs Work

| Metric | Count |
|--------|-------|
| Total pages audited | 29 |
| Pages rated "Critical" | 1 (Dashboard) |
| Pages rated "Needs Work" | 26 |
| Pages rated "Good" | 2 (Certificates List, empty-state, status-badge) |
| P1 (Critical) issues | ~35 |
| P2 (Medium) issues | ~65 |
| P3 (Low) issues | ~55 |

### Top 5 Systemic Issues (Affect ALL Pages)

1. **Zero i18n** — Every page has 100% hardcoded French strings. `useTranslations()` is never called despite `NextIntlClientProvider` being configured. Arabic RTL and English are completely broken.
2. **No error handling** — No page checks `isError` from TanStack Query hooks. API failures show either infinite spinners or misleading "not found" messages.
3. **No error boundaries** — No `error.tsx` files exist in any route segment. Runtime JS errors crash the entire page.
4. **No breadcrumbs** — No breadcrumb component exists in the project. All sub-pages rely on `router.back()` which is unreliable.
5. **No accessibility on icon buttons** — Zero `aria-label` attributes across ~40+ icon-only buttons.

---

## Global Cross-Cutting Issues

These issues affect ALL or MOST pages and should be fixed as shared infrastructure before individual page fixes.

### GX-1: i18n Not Implemented [P1]
- **Scope**: All 29 pages
- **Issue**: Every user-facing string is hardcoded in French. The `[locale]` route segment exists but is ignored.
- **Fix**: Implement `useTranslations()` in every page. Create `fr.json`, `ar.json`, `en.json` translation files.
- **Files**: All page.tsx files + all form components

### GX-2: No Error Handling on Data Fetches [P1]
- **Scope**: All list and detail pages
- **Issue**: `isError`/`error` never destructured from TanStack Query hooks. No distinction between "not found" (404) and "server error" (500).
- **Fix**: Add `isError` checks to every hook usage. Create a shared `<ErrorState>` component with retry button.
- **Files**: All page.tsx files

### GX-3: No Error Boundaries [P1]
- **Scope**: Entire doctor space
- **Issue**: No `error.tsx` files exist. Unhandled runtime errors crash the page with a white screen.
- **Fix**: Create `error.tsx` in `(doctor)/doctor/` and optionally in each module folder.
- **Files**: New files needed

### GX-4: No Breadcrumbs Component [P2]
- **Scope**: All sub-pages (detail, edit, new)
- **Issue**: No breadcrumb component exists. All navigation relies on `router.back()`.
- **Fix**: Create a `<Breadcrumb>` component. Add breadcrumb support to `<PageHeader>`.
- **Files**: `components/ui/breadcrumb.tsx`, `components/ui/page-header.tsx`

### GX-5: No aria-label on Icon Buttons [P2]
- **Scope**: All pages with back/edit/delete/print buttons
- **Issue**: ~40+ icon-only buttons have no `aria-label`. WCAG violation.
- **Fix**: Add `aria-label` to every icon-only `<Button>` globally.
- **Files**: All page.tsx and form component files

### GX-6: Router Paths Missing Locale Prefix [P2]
- **Scope**: All `router.push()` and `<Link href="...">` calls
- **Issue**: Paths like `/doctor/patients/new` lack `[locale]` prefix. Broken for ar/en locales.
- **Fix**: Use `next-intl`'s `Link` component or a locale-aware router helper.
- **Files**: All page.tsx files + DoctorSidebar.tsx

### GX-7: DataTable Missing Core Features [P1]
- **Scope**: All list pages using `<DataTable>`
- **Issue**: No pagination, no sorting, no filtering, no search. No keyboard accessibility on clickable rows.
- **Fix**: Upgrade DataTable with pagination/sort/filter support, or replace with a TanStack Table wrapper.
- **Files**: `components/ui/data-table.tsx`

### GX-8: No Skeleton UI Component [P2]
- **Scope**: All loading states
- **Issue**: Loading states use raw `animate-pulse` divs. No reusable `<Skeleton>` component.
- **Fix**: Create `components/ui/skeleton.tsx` and use layout-matching skeletons on all pages.
- **Files**: New component + all page.tsx files

### GX-9: No Unsaved Changes Guard [P3]
- **Scope**: All form pages (new/edit)
- **Issue**: No `beforeunload` handler. Navigating away from dirty forms loses data silently.
- **Fix**: Create a `useUnsavedChanges` hook. Apply to all form pages.
- **Files**: New hook + all form pages

### GX-10: No Confirmation Dialogs for Destructive Actions [P2]
- **Scope**: All delete/cancel actions
- **Issue**: No `AlertDialog` usage anywhere. Delete hooks exist but are unused.
- **Fix**: Create delete confirmation patterns using shadcn `AlertDialog`.
- **Files**: All detail pages that need delete actions

---

## Squad A — Dashboard + Patients

### Page: Dashboard (`/doctor/dashboard`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/dashboard/page.tsx`
**Status**: Critical

**Issues**:
- [P1] No data fetching — entire KPI grid is hardcoded with placeholder dashes (`"--"`, `"-- MAD"`)
- [P1] No loading state — no skeletons or spinners
- [P1] No error handling — no error boundary, no fallback
- [P1] No charts rendered — `AreaChartWidget`, `BarChartWidget`, `PieChartWidget` exist but are not imported
- [P2] `useTranslations` imported but never used (dead import)
- [P2] Not using the `StatCard` component — raw `<div>` cards instead of reusable component
- [P2] Not using `PageHeader` component — custom header markup
- [P3] No empty state for zero-activity doctors (no onboarding)
- [P3] Not a client component — no `"use client"` directive

**Missing features**:
- Real data fetching from dashboard API
- Charts (appointment trends, revenue, demographics)
- Quick actions section
- Today's schedule widget
- Recent patients widget

---

### Page: Patients List (`/doctor/patients`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/patients/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling — `isError` not checked from `usePatients()`
- [P1] All strings hardcoded in French
- [P2] Filters button is non-functional — has no `onClick` handler
- [P2] No column sorting in DataTable
- [P2] Navigation paths missing locale prefix
- [P3] No aria-labels on icon buttons
- [P3] Pagination doesn't indicate loading during page transitions
- [P3] Sexe column has no fallback for null values

**Missing features**:
- Error state UI with retry
- Functional filter panel (sex, city, blood type, date range)
- Bulk selection / bulk actions
- Export (CSV/Excel)
- Delete patient action

---

### Page: New Patient (`/doctor/patients/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/patients/new/page.tsx`
**Form**: `frontend/src/components/patients/patient-form.tsx`
**Status**: Needs Work

**Issues**:
- [P1] Server-side validation errors (422) not mapped to form fields — only generic toast
- [P2] All strings hardcoded in French
- [P2] Back button has no `aria-label`
- [P2] Navigation path missing locale prefix
- [P3] No unsaved changes warning
- [P3] Form may allow double submission before mutation starts

**Strengths** (keep as-is):
- Zod schema properly defined with meaningful French error messages
- Required fields marked with `*`
- `FormMessage` components render inline validation errors
- Consent checkbox for Law 09-08
- Loading spinner on submit button

---

### Page: Patient Detail (`/doctor/patients/[id]`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/patients/[id]/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling — misleading "Patient introuvable" on server errors
- [P1] No delete functionality — `useDeletePatient` hook exists but unused
- [P2] All strings hardcoded in French
- [P2] Navigation paths missing locale
- [P2] Back/edit/upload buttons lack `aria-label`
- [P2] Photo upload has no loading indicator on avatar
- [P3] Minimal loading skeleton (2 rectangles)
- [P3] `<img>` used instead of `next/image`
- [P3] Consent status is not actionable (no button to record consent)
- [P3] "Nouvelle consultation" button has no `onClick` handler

**Missing features**:
- Delete patient with confirmation dialog
- Tab system for consultations, documents, prescriptions, payments
- Print/export patient fiche (PDF)
- Working "Nouvelle consultation" button

---

### Page: Edit Patient (`/doctor/patients/[id]/edit`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/patients/[id]/edit/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling for fetch failure
- [P1] No server-side validation error mapping
- [P2] All strings hardcoded in French
- [P2] Navigation paths missing locale
- [P2] Back button has no `aria-label`
- [P3] Minimal loading skeleton
- [P3] No unsaved changes warning
- [P3] Form `defaultValues` may not reset on patient data change

**Missing features**:
- Error state with retry
- Server validation error mapping
- Form reset button

---

## Squad B — Appointments + Consultations

### Page: Appointments (`/doctor/appointments`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/appointments/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] **No patient selector in AppointmentForm** — `patient_id` required by Zod but no form field renders for it. User cannot pick a patient.
- [P1] No error state for failed data fetches — infinite spinner on API failure
- [P2] Hardcoded French strings — no i18n
- [P2] View toggle buttons lack accessibility attributes (no `aria-label`, `aria-pressed`, `role="tab"`)
- [P2] **Calendar end-of-month bug** — line 118 hardcodes `end: "yyyy-MM-28"`, missing days 29-31
- [P3] No empty state illustration for calendar view
- [P3] No "New Appointment" CTA in list empty state

**Missing features**:
- Search/filter by patient, status, date range
- Click calendar event to view/edit appointment
- Delete/cancel appointment action
- Confirmation dialog for cancelling appointments
- Breadcrumbs

---

### Page: Consultations List (`/doctor/consultations`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/consultations/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No "New Consultation" button in PageHeader
- [P1] No error handling for failed API call
- [P2] Hardcoded French strings
- [P2] Pagination buttons lack accessibility
- [P2] No search or filtering
- [P3] Empty state has no CTA action
- [P3] Table columns not optimized for mobile

**Missing features**:
- Column sorting
- Date range / status filter
- Search by patient name
- Breadcrumbs
- Delete/edit actions

---

### Page: New Consultation (`/doctor/consultations/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/consultations/new/page.tsx`
**Form**: `frontend/src/components/consultations/consultation-form.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling on mutation failure — 422 errors not mapped to fields
- [P2] Hardcoded French strings
- [P2] Mixed language placeholder: "Findings..." (English) among French placeholders
- [P2] Back button has no `aria-label`
- [P3] No breadcrumbs
- [P3] Cancel button uses `window.history.back()` — fragile
- [P3] No patient name displayed at top of form

**Missing features**:
- Patient name/info banner
- Auto-save / draft functionality
- `<FormMessage />` on numeric vital fields
- Keyboard shortcut to submit (Ctrl+Enter)

---

### Page: Consultation Detail (`/doctor/consultations/[id]`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/consultations/[id]/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling — 404 and 500 treated identically with no retry
- [P2] Hardcoded French strings
- [P2] Back button has no `aria-label`
- [P2] No edit functionality — page is read-only
- [P2] PDF button has no loading state — rapid clicks trigger multiple downloads
- [P3] Loading skeleton too simple
- [P3] Vital component treats `0` as falsy — `if (!value)` should be `if (value == null)`
- [P3] Action buttons may overflow on narrow screens

**Missing features**:
- Edit button
- Delete action with confirmation
- Navigation to prev/next consultation
- Linked prescriptions section
- Audit trail / last-modified timestamp

---

## Squad C — Prescriptions + Certificates

### Page: Prescriptions List (`/doctor/prescriptions`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/prescriptions/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling — `isError` not checked
- [P1] No pagination — `page: 1` hardcoded, `meta` never used
- [P2] Empty state inconsistent with Certificates page — not using `<EmptyState>` component
- [P2] No search or filtering
- [P2] No column sorting
- [P3] Router path not locale-aware
- [P3] Table rows lack keyboard accessibility

---

### Page: New Prescription (`/doctor/prescriptions/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/prescriptions/new/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error feedback — 422 errors not mapped to form fields
- [P1] `patient_id` defaults to 0 if missing — no patient selector
- [P2] No patient context shown (no name/dossier number)
- [P2] Delete button on medication lines lacks `aria-label`
- [P2] No unsaved changes guard
- [P3] Hardcoded French strings

**Missing features**:
- Patient selector or info display
- Medication autocomplete from database
- Server-side error mapping

---

### Page: Prescription Detail (`/doctor/prescriptions/[id]`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/prescriptions/[id]/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling — no distinction between 404 and 500
- [P2] Loading state is single grey rectangle
- [P2] `useDeletePrescription` hook exists but unused — no delete button
- [P2] Back button has no `aria-label`
- [P3] Hardcoded French strings
- [P3] No edit capability
- [P3] Dot separators wrap poorly on mobile

---

### Page: Certificates List (`/doctor/certificates`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/certificates/page.tsx`
**Status**: Good

**Issues**:
- [P2] No error handling
- [P2] No pagination
- [P2] No search or filtering
- [P3] Router paths not locale-aware
- [P3] Hardcoded French strings

**Note**: Best list page — properly uses `<EmptyState>` with icon, title, description, and CTA. Use as template for other list pages.

---

### Page: New Certificate (`/doctor/certificates/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/certificates/new/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] `patient_id` defaults to 0 if missing — no patient selector
- [P1] No patient context displayed
- [P2] Server-side validation errors not mapped to form fields
- [P2] `date_debut`, `date_fin`, `nombre_jours` fields missing `<FormMessage>`
- [P2] `nombre_jours` auto-calculation missing (should compute from date range)
- [P2] No unsaved changes guard
- [P3] Back button lacks `aria-label`
- [P3] Hardcoded French strings
- [P3] `date_certificat` field missing `<FormMessage>`

**Missing features**:
- Patient selector or info display
- Auto-calculation of `nombre_jours`
- Template system (pre-fill content by certificate type)

---

### Page: Certificate Detail (`/doctor/certificates/[id]`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/certificates/[id]/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling — 500 shows "Certificat introuvable"
- [P2] Loading state is single grey rectangle
- [P2] Back button lacks `aria-label`
- [P2] No delete or edit actions
- [P2] Print button has no loading state
- [P3] Hardcoded French strings
- [P3] `nombre_jours` falsy check hides value `0` — should use `!= null`
- [P3] Signature placeholder is static

---

## Squad D — Payments + Invoices + Expenses

### Page: Payments List (`/doctor/payments`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/payments/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling for list fetch
- [P1] **No pagination** — `per_page: 30` hardcoded, no pagination controls at all
- [P1] All strings hardcoded in French
- [P2] Empty state is plain string, not using `<EmptyState>` component
- [P2] KPIs computed from first 30 results only — should use server-side aggregates
- [P2] No search or filtering
- [P2] Print receipt button has no `aria-label`
- [P3] Router paths missing locale prefix
- [P3] `useState` imported but never used

**Missing features**:
- Pagination controls
- Date range filter, search by patient, filter by payment mode
- Row click action
- Delete/void payment

---

### Page: New Payment (`/doctor/payments/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/payments/new/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] **No patient selector** — reads `patient_id` from URL, defaults to `0` if missing
- [P1] All strings hardcoded in French
- [P1] No error handling on submission — 422 errors not mapped to fields
- [P2] Back button has no `aria-label`
- [P2] Missing `<FormMessage />` on `date_paiement` field
- [P2] `montant_paye` allows 0 but field marked as required (`*`)
- [P3] Router path missing locale prefix

**Missing features**:
- Patient selector dropdown
- Patient info display
- Receipt/proof-of-payment upload

---

### Page: Invoices List (`/doctor/invoices`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/invoices/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling for list fetch
- [P1] All strings hardcoded in French
- [P2] No search or filtering (no status filter)
- [P2] No KPI summary cards (unlike Payments and Expenses)
- [P2] Print PDF button lacks `aria-label`
- [P2] Pagination shows no current page or total
- [P2] Href paths missing locale prefix
- [P3] No row click navigation
- [P3] `STATUT_LABELS` and `STATUT_VARIANTS` duplicated with Invoice Detail

**Missing features**:
- Status filter (brouillon/emise/payee/annulee)
- Date range filter, search by patient/invoice number
- KPI summary cards
- Current page indicator in pagination
- Delete/cancel action

---

### Page: New Invoice (`/doctor/invoices/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/invoices/new/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] **Patient list loads only page 1** — doctors with many patients can't access all of them
- [P1] All strings hardcoded in French
- [P1] No error handling on form submission — no try/catch around `mutateAsync`
- [P2] Back button has no `aria-label`
- [P2] Delete line button has no `aria-label`
- [P2] No confirmation when removing invoice line
- [P2] Line items grid cramped on mobile
- [P3] No breadcrumbs
- [P3] Form uses raw `<Label>`/`<Input>` instead of shadcn `<Form>`/`<FormField>` (inconsistent)

**Missing features**:
- Patient search/typeahead
- Draft save capability
- Receipt attachment

---

### Page: Invoice Detail (`/doctor/invoices/[id]`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/invoices/[id]/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] All strings hardcoded in French
- [P2] Loading state is single grey block
- [P2] "Facture introuvable" is bare text — no proper 404 state
- [P2] No actions beyond printing (no status change, edit, delete)
- [P2] Back button has no `aria-label`
- [P3] `STATUT_LABELS`/`STATUT_VARIANTS` duplicated from Invoices list
- [P3] No breadcrumbs

**Missing features**:
- Status change actions (Emettre, Marquer payee, Annuler)
- Edit invoice (especially for drafts)
- Create linked payment button
- Audit trail

---

### Page: Expenses List (`/doctor/expenses`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/expenses/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling for list fetch
- [P1] All strings hardcoded in French
- [P2] KPIs computed client-side from current page only — inaccurate
- [P2] **Date range fixed to current month** — no date picker to change
- [P2] Pagination shows no current page or total
- [P2] No row click action — no edit/detail page
- [P3] No delete or edit capability for expenses
- [P3] No `aria-label` on receipt link

**Missing features**:
- Date range picker
- Edit/delete expense
- Export to CSV/PDF
- Search by description/supplier
- Column sorting

---

### Page: New Expense (`/doctor/expenses/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/expenses/new/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] All strings hardcoded in French
- [P1] No error handling on submission — no try/catch around `mutateAsync`
- [P2] **No receipt/file upload** — `recu_url` field exists but no upload UI
- [P2] Back button has no `aria-label`
- [P2] Form uses raw `<Label>`/`<Input>` instead of shadcn `<Form>` (inconsistent)
- [P3] `CATEGORY_LABELS` slightly different between list and form pages
- [P3] No breadcrumbs

**Missing features**:
- Receipt upload
- Recurring expense toggle
- Supplier autocomplete

---

## Squad E — Medications + Documents

### Page: Medications List (`/doctor/medications`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/medications/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No error handling for failed API calls
- [P1] `useDeactivateMedication` imported but never used — no deactivation UI
- [P2] `handleEdit` uses `window.location.href` instead of Next.js router — full page reload
- [P2] No `aria-label` on stock adjuster, edit, and alert filter buttons
- [P2] KPI fetch retrieves 200 records client-side just for counts — should be dedicated endpoint
- [P3] Hardcoded French strings
- [P3] Link hrefs not locale-aware

**Missing features**:
- Deactivation/delete flow with confirmation
- Error state UI
- Breadcrumbs

---

### Page: New Medication (`/doctor/medications/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/medications/new/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No API error feedback mapped to form fields
- [P2] Only `nom` shows inline validation — `prix_achat`/`prix_vente` errors not displayed
- [P2] Back button has no `aria-label`
- [P2] Cancel button not disabled during submission
- [P3] Hardcoded French strings
- [P3] **Zod schema duplicated** between new and edit pages
- [P3] No breadcrumbs

**Missing features**:
- Server-side error mapping
- Unsaved changes warning
- Shared schema extraction

---

### Page: Edit Medication (`/doctor/medications/[id]/edit`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/medications/[id]/edit/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] No API error feedback mapped to form fields
- [P2] Minimal loading skeleton
- [P2] "Medicament introuvable" fallback too sparse
- [P2] Back button has no `aria-label`
- [P2] No deactivation option
- [P3] Hardcoded French strings
- [P3] Duplicated Zod schema
- [P3] `useEffect` dependency on `form`

**Missing features**:
- Deactivation/archive action
- Unsaved changes warning
- Last-modified metadata display

---

### Page: Documents List (`/doctor/documents`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/documents/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] **`toggleShare` hook instantiated incorrectly** — raw `api.patch()` bypasses cache invalidation
- [P1] No error handling for failed data fetches
- [P2] No search or filtering
- [P2] No `aria-label` on icon buttons (~5 buttons)
- [P2] **Custom tabs instead of shadcn `<Tabs>`** — lacks ARIA roles and keyboard nav
- [P2] Pagination missing page indicator
- [P3] Hardcoded French strings
- [P3] Link hrefs not locale-aware

**Missing features**:
- Search/filter functionality
- Proper ARIA tab roles
- Edit functionality for existing reports/expertises

---

### Page: New Report (`/doctor/documents/reports/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/documents/reports/new/page.tsx`
**Status**: Needs Work

**Issues**:
- [P2] Patient selector UX is clunky — separate search + select instead of combobox
- [P2] No API error feedback mapped to form fields
- [P2] Raw `<input type="checkbox">` instead of shadcn `<Checkbox>`
- [P2] Back button has no `aria-label`
- [P2] No loading state for patient list
- [P3] Hardcoded French strings
- [P3] No breadcrumbs
- [P3] No character count for content textarea

---

### Page: New Expertise (`/doctor/documents/expertises/new`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/documents/expertises/new/page.tsx`
**Status**: Needs Work

**Issues**:
- [P2] Same clunky patient selector
- [P2] No API error feedback mapped to form fields
- [P2] `contenu` is optional but no helper text explains why
- [P2] Back button has no `aria-label`
- [P2] **No file attachment upload** — data model supports it but form doesn't
- [P3] Hardcoded French strings
- [P3] **`?tab=expertises` redirect parameter is ignored** by documents page

**Missing features**:
- File attachment upload
- Combobox patient selector
- Draft/auto-save

---

## Squad F — Reports + Layout + Sidebar + Shared Components

### Page: Reports (`/doctor/reports`)
**File**: `frontend/src/app/[locale]/(doctor)/doctor/reports/page.tsx`
**Status**: Needs Work

**Issues**:
- [P1] All strings hardcoded in French — zero i18n
- [P1] No error handling for API failures — silent empty charts
- [P2] Date formatting hardcoded to French locale
- [P2] Second KPI row uses raw `<div>` instead of `<StatCard>`
- [P2] No loading skeleton for second KPI row
- [P3] Pie chart colors are hardcoded hex — won't adapt to dark mode
- [P3] No loading indicator on "Actualiser" button
- [P3] `useTopProcedures` not bound to date range
- [P3] PDF export has no loading state

**Missing features**:
- RTL layout adjustments
- Print-friendly stylesheet
- CSV/Excel export
- Compare to previous period

---

### Infrastructure: Doctor Layout
**File**: `frontend/src/app/[locale]/(doctor)/layout.tsx`
**Status**: Needs Work

**Issues**:
- [P1] **No mobile responsive behavior** — zero breakpoint classes
- [P1] **No mobile overlay/drawer** — sidebar always visible, consumes viewport on mobile
- [P2] No header bar (no user info, notifications, hamburger toggle)
- [P2] RTL may need explicit `rtl:` variants for sidebar animation
- [P3] Content padding fixed at `p-6` — too much on small screens

**Missing features**:
- Hamburger menu + Sheet drawer for mobile
- Top header bar with notifications, user dropdown, global search
- Breadcrumb trail in header
- Dark mode toggle
- Responsive padding

---

### Infrastructure: DoctorSidebar
**File**: `frontend/src/components/layouts/DoctorSidebar.tsx`
**Status**: Needs Work

**Issues**:
- [P1] **Sidebar links not locale-aware** — uses `next/link` not `next-intl` Link
- [P1] No mobile drawer behavior — static `<aside>` always renders
- [P2] No ARIA attributes (`role="navigation"`, `aria-expanded`, `aria-label`)
- [P2] Hardcoded "Medecin" role label not translated
- [P2] `h-4.5 w-4.5` may not be valid Tailwind classes
- [P3] Logout redirects to `/login` without locale prefix
- [P3] Avatar circle may have low contrast

**Missing features**:
- Notification badge count
- Keyboard navigation
- Nav item grouping/sections

---

### Shared: DataTable (`components/ui/data-table.tsx`)
**Issues**:
- [P1] No pagination support
- [P1] No sorting support
- [P1] No filtering or search
- [P2] No ARIA attributes (`aria-label`, `aria-busy`)
- [P2] Hardcoded "Aucun resultat" fallback
- [P2] No responsive strategy (column hiding, card view)
- [P3] Loading state is single spinner (should be skeleton rows)

### Shared: PageHeader (`components/ui/page-header.tsx`)
**Issues**:
- [P2] No breadcrumb support
- [P3] Title size fixed at `text-xl` (no responsive scaling)
- [P3] No divider/bottom border

### Shared: EmptyState (`components/ui/empty-state.tsx`)
**Status**: Good
- [P3] No illustration/image support (only Lucide icons)
- [P3] No animation

### Shared: StatCard (`components/ui/stat-card.tsx`)
**Issues**:
- [P2] No built-in loading state (`isLoading` prop)
- [P3] May not contrast well in dark mode
- [P3] No responsive font sizing

### Shared: StatusBadge (`components/ui/status-badge.tsx`)
**Status**: Good
- Well-implemented with CVA variants and dark mode support

### Tailwind / Green Theme (`globals.css`)
**Status**: Good
- `.theme-doctor` correctly overrides CSS variables for green branding
- Dark mode variants defined
- RTL foundation via `dir="rtl"` and `:lang(ar)` rule

---

## Priority Matrix

### P0 — Blockers (Fix Immediately)
| # | Issue | Scope | Est. Effort |
|---|-------|-------|-------------|
| 1 | DataTable: Add pagination, sorting, filtering | All list pages | Large |
| 2 | Doctor Layout: Mobile responsive + drawer | All pages | Large |
| 3 | Dashboard: Wire up real data + charts | Dashboard | Large |

### P1 — Critical (Fix This Sprint)
| # | Issue | Scope | Est. Effort |
|---|-------|-------|-------------|
| 4 | i18n: Implement `useTranslations()` everywhere | All 29 pages | Large |
| 5 | Error handling: Add `isError` checks + error UI | All pages | Medium |
| 6 | Error boundaries: Create `error.tsx` files | Route segments | Small |
| 7 | Sidebar: Locale-aware links | DoctorSidebar | Small |
| 8 | Appointments: Fix patient selector in form | Appointments | Medium |
| 9 | Appointments: Fix end-of-month bug (day 28) | Appointments | Small |
| 10 | Forms: Add patient selector to all form pages | Prescriptions, Certificates, Payments | Medium |
| 11 | Forms: Map 422 validation errors to fields | All form pages | Medium |
| 12 | Documents: Fix `toggleShare` hook usage | Documents list | Small |

### P2 — Medium (Fix Next Sprint)
| # | Issue | Scope | Est. Effort |
|---|-------|-------|-------------|
| 13 | Breadcrumbs: Create component + add to PageHeader | All sub-pages | Medium |
| 14 | Accessibility: Add `aria-label` to all icon buttons | All pages | Medium |
| 15 | Skeleton: Create component + add layout-matching skeletons | All pages | Medium |
| 16 | Locale routing: Fix all `router.push` and `<Link>` paths | All pages | Medium |
| 17 | Doctor layout: Add top header bar | Layout | Medium |
| 18 | Sidebar: Add ARIA attributes | DoctorSidebar | Small |
| 19 | StatCard: Add `isLoading` prop | StatCard + consumers | Small |
| 20 | Invoices: Add status change actions | Invoice detail | Medium |
| 21 | Expenses: Add date range picker | Expenses list | Medium |
| 22 | Documents: Replace custom tabs with shadcn Tabs | Documents list | Small |
| 23 | Medications: Fix `window.location.href` → `router.push` | Medications list | Small |
| 24 | KPIs: Move to server-side aggregates | Payments, Expenses, Medications | Medium |
| 25 | Forms: Standardize on shadcn Form/FormField/FormMessage | Invoices, Expenses | Medium |

### P3 — Low (Backlog)
| # | Issue | Scope | Est. Effort |
|---|-------|-------|-------------|
| 26 | Unsaved changes guard hook | All form pages | Small |
| 27 | Confirmation dialogs for destructive actions | Detail pages | Medium |
| 28 | `next/image` instead of `<img>` | Patient detail | Small |
| 29 | Certificates: Auto-calculate `nombre_jours` | New certificate | Small |
| 30 | Reports: Use CSS variables for chart colors | Reports | Small |
| 31 | Prescriptions: Medication autocomplete | New prescription | Medium |
| 32 | Sidebar: Group nav items into sections | DoctorSidebar | Small |
| 33 | Extract shared constants (STATUT_LABELS, CATEGORY_LABELS) | Invoices, Expenses | Small |
| 34 | Extract shared Zod schemas (medications) | Medications | Small |
| 35 | Documents: Wire `?tab=` query param to page state | Documents | Small |

---

## Recommended Execution Order

```
Phase 1 — Infrastructure (unblocks everything):
  1. DataTable upgrade (pagination, sort, filter)
  2. Doctor Layout mobile responsive + header bar
  3. DoctorSidebar locale-aware links + mobile drawer
  4. Create ErrorState, Skeleton, Breadcrumb components
  5. Create error.tsx boundary files

Phase 2 — Critical Fixes:
  6. Dashboard: wire real data + charts
  7. i18n: add useTranslations to all pages
  8. Error handling: add isError checks everywhere
  9. Forms: patient selectors + 422 error mapping
  10. Appointments: fix patient selector + end-of-month bug

Phase 3 — UX Polish:
  11. Breadcrumbs on all sub-pages
  12. aria-labels on all icon buttons
  13. Layout-matching skeletons
  14. Locale-aware routing
  15. Confirmation dialogs
  16. Unsaved changes guard
  17. KPIs from server-side aggregates

Phase 4 — Nice-to-Have:
  18. Medication autocomplete
  19. Certificate template system
  20. Chart color theming
  21. CSV/Excel export
  22. Sidebar nav grouping
```
