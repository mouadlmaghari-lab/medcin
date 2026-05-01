#!/bin/bash
# Create beads from TabibCare Doctor Space UI/UX Audit Report
# Source: frontend/implementation_fix.md
set -e
cd "C:/Medcin"

echo "=== Creating Frontend UI/UX Audit Beads ==="
echo ""

# ============================================================
# PHASE 1 — Infrastructure (P0 Blockers)
# ============================================================

echo "--- Phase 1: P0 Blockers (Infrastructure) ---"

bd create "DataTable: Add pagination, sorting, and filtering support" \
  -p 0 -l "frontend" -t task \
  -d "GX-7: DataTable component (components/ui/data-table.tsx) has no pagination, sorting, filtering, or search. No keyboard accessibility on clickable rows. Affects ALL list pages (patients, appointments, consultations, prescriptions, certificates, payments, invoices, expenses, medications, documents). Fix: Upgrade DataTable with TanStack Table wrapper supporting pagination/sort/filter/search, add ARIA attributes (aria-label, aria-busy), responsive strategy (column hiding, card view on mobile), and skeleton row loading states. Est: Large."

bd create "Doctor Layout: Add mobile responsive behavior and drawer navigation" \
  -p 0 -l "frontend" -t task \
  -d "Doctor Layout (app/[locale]/(doctor)/layout.tsx) has zero breakpoint classes and no mobile overlay/drawer. Sidebar always visible, consuming full viewport on mobile. No header bar (user info, notifications, hamburger toggle). Content padding fixed at p-6 (too much on small screens). Fix: Add hamburger menu + Sheet drawer for mobile, top header bar with notifications/user dropdown/global search, breadcrumb trail in header, dark mode toggle, responsive padding. Also fix DoctorSidebar (components/layouts/DoctorSidebar.tsx) which has no mobile drawer behavior — static aside always renders. Est: Large."

bd create "Dashboard: Wire up real data fetching and chart components" \
  -p 0 -l "frontend" -t task \
  -d "Dashboard page (app/[locale]/(doctor)/doctor/dashboard/page.tsx) rated Critical. Entire KPI grid is hardcoded with placeholder dashes ('--', '-- MAD'). No data fetching, no loading state, no error handling, no error boundary. AreaChartWidget, BarChartWidget, PieChartWidget exist but are not imported. useTranslations imported but never used. Not using StatCard or PageHeader components. Missing: real data fetching from dashboard API, charts (appointment trends, revenue, demographics), quick actions section, today's schedule widget, recent patients widget. Est: Large."

# ============================================================
# PHASE 2 — Critical Fixes (P1)
# ============================================================

echo "--- Phase 2: P1 Critical Fixes ---"

bd create "i18n: Implement useTranslations() across all 29 doctor pages" \
  -p 1 -l "frontend" -t task \
  -d "GX-1: Every user-facing string is hardcoded in French across all 29 pages. The [locale] route segment exists but is ignored. useTranslations() is never called despite NextIntlClientProvider being configured. Arabic RTL and English are completely broken. Fix: Implement useTranslations() in every page, create fr.json, ar.json, en.json translation files. Scope: All page.tsx files + all form components. Est: Large."

bd create "Error handling: Add isError checks and ErrorState component to all pages" \
  -p 1 -l "frontend" -t task \
  -d "GX-2: No page checks isError from TanStack Query hooks. API failures show either infinite spinners or misleading 'not found' messages. No distinction between 404 and 500 errors. Affects all list and detail pages. Fix: Add isError/error destructuring to every hook usage, create shared <ErrorState> component with retry button, differentiate 404 vs 500 responses. Scope: All page.tsx files. Est: Medium."

bd create "Error boundaries: Create error.tsx files for all route segments" \
  -p 1 -l "frontend" -t task \
  -d "GX-3: No error.tsx files exist in entire doctor space. Unhandled runtime errors crash the page with a white screen. Fix: Create error.tsx in (doctor)/doctor/ and in each module folder. Est: Small."

bd create "DoctorSidebar: Fix locale-aware links and add ARIA attributes" \
  -p 1 -l "frontend" -t task \
  -d "DoctorSidebar (components/layouts/DoctorSidebar.tsx) uses next/link instead of next-intl Link — all sidebar navigation broken for ar/en locales. No ARIA attributes (role=navigation, aria-expanded, aria-label). Hardcoded 'Medecin' role label not translated. h-4.5 w-4.5 may not be valid Tailwind classes. Logout redirects to /login without locale prefix. Fix: Use next-intl Link, add ARIA navigation roles, translate labels. Est: Small."

bd create "Appointments: Fix missing patient selector in AppointmentForm" \
  -p 1 -l "frontend" -t bug \
  -d "AppointmentForm has patient_id required by Zod schema but no form field renders for it — user cannot pick a patient. This makes appointment creation completely non-functional. Fix: Add patient search/select combobox to AppointmentForm. File: components/appointments/appointment-form.tsx. Est: Medium."

bd create "Appointments: Fix calendar end-of-month bug (hardcoded day 28)" \
  -p 1 -l "frontend" -t bug \
  -d "Appointments page line 118 hardcodes calendar end date as 'yyyy-MM-28', missing days 29-31 of any month. Appointments on the 29th-31st are invisible in calendar view. File: app/[locale]/(doctor)/doctor/appointments/page.tsx. Fix: Use proper end-of-month calculation. Est: Small."

bd create "Forms: Add patient selector to Prescriptions, Certificates, and Payments new pages" \
  -p 1 -l "frontend" -t task \
  -d "Multiple form pages have patient_id defaulting to 0 with no patient selector UI: New Prescription (prescriptions/new) — patient_id defaults to 0, no patient context shown. New Certificate (certificates/new) — patient_id defaults to 0, no patient context. New Payment (payments/new) — reads patient_id from URL, defaults to 0. Fix: Add patient search/select combobox to all three forms, display patient info banner. Est: Medium."

bd create "Forms: Map 422 server validation errors to form fields on all form pages" \
  -p 1 -l "frontend" -t task \
  -d "No form page maps Laravel 422 validation errors to individual fields. All forms only show generic toast on validation failure. Affected pages: New/Edit Patient, New Consultation, New Prescription, New Certificate, New Payment, New Invoice, New Expense, New/Edit Medication, New Report, New Expertise. Fix: Create shared utility to map Laravel 422 error response to React Hook Form setError() calls. Est: Medium."

bd create "Documents: Fix toggleShare hook bypassing cache invalidation" \
  -p 1 -l "frontend" -t bug \
  -d "Documents list page (app/[locale]/(doctor)/doctor/documents/page.tsx) has toggleShare hook instantiated incorrectly — raw api.patch() bypasses TanStack Query cache invalidation. Toggling share status doesn't update UI until page refresh. Fix: Use proper mutation with query cache invalidation. Est: Small."

bd create "Prescriptions list: Fix missing pagination (hardcoded page 1)" \
  -p 1 -l "frontend" -t bug \
  -d "Prescriptions list page (prescriptions/page.tsx) has page: 1 hardcoded and meta pagination data is never used. Only first page of prescriptions ever displays. Fix: Implement pagination controls using meta from API response. Est: Small."

bd create "Consultations list: Add missing New Consultation button" \
  -p 1 -l "frontend" -t bug \
  -d "Consultations list page (consultations/page.tsx) has no 'New Consultation' button in PageHeader. Users cannot create new consultations from the list view. Fix: Add action button to PageHeader. Est: Small."

bd create "Payments list: Fix missing pagination (hardcoded per_page: 30)" \
  -p 1 -l "frontend" -t bug \
  -d "Payments list page (payments/page.tsx) has per_page: 30 hardcoded with no pagination controls. Only first 30 payments display. KPI summary cards computed from first 30 results only (should use server-side aggregates). Fix: Add pagination controls, use server-side KPI endpoint. Est: Medium."

bd create "Invoices new: Fix patient list loading only page 1" \
  -p 1 -l "frontend" -t bug \
  -d "New Invoice page (invoices/new/page.tsx) loads patient list from page 1 only. Doctors with many patients can't access all of them in the patient selector. No error handling on form submission (no try/catch around mutateAsync). Fix: Implement patient search/typeahead instead of loading full list. Est: Medium."

bd create "Medications: Fix unused useDeactivateMedication and missing deactivation UI" \
  -p 1 -l "frontend" -t task \
  -d "Medications list page imports useDeactivateMedication hook but never uses it — no deactivation UI exists. No error handling for failed API calls. Fix: Add deactivation flow with confirmation dialog, add error state UI. File: medications/page.tsx. Est: Medium."

# ============================================================
# PHASE 3 — Medium Priority (P2)
# ============================================================

echo "--- Phase 3: P2 Medium Priority ---"

bd create "Breadcrumbs: Create component and integrate with PageHeader" \
  -p 2 -l "frontend" -t task \
  -d "GX-4: No breadcrumb component exists in the project. All sub-pages rely on router.back() which is unreliable. Fix: Create components/ui/breadcrumb.tsx, add breadcrumb support to PageHeader component. Apply to all detail, edit, and new pages across all modules. Est: Medium."

bd create "Accessibility: Add aria-label to all icon-only buttons across all pages" \
  -p 2 -l "frontend" -t task \
  -d "GX-5: ~40+ icon-only buttons across all pages have no aria-label. WCAG violation. Affected: back buttons, edit buttons, delete buttons, print buttons, stock adjusters, filter buttons, receipt links. Fix: Add aria-label to every icon-only Button globally. Est: Medium."

bd create "Skeleton: Create reusable Skeleton component and layout-matching loading states" \
  -p 2 -l "frontend" -t task \
  -d "GX-8: Loading states use raw animate-pulse divs. No reusable Skeleton component. Most loading states are minimal (single grey rectangle). Fix: Create components/ui/skeleton.tsx and implement layout-matching skeletons on all pages. Est: Medium."

bd create "Locale routing: Fix all router.push and Link href paths to include locale prefix" \
  -p 2 -l "frontend" -t task \
  -d "GX-6: All router.push() and Link href calls use paths like /doctor/patients/new without [locale] prefix. Broken for ar/en locales. Scope: All page.tsx files + DoctorSidebar.tsx. Fix: Use next-intl Link component or locale-aware router helper everywhere. Est: Medium."

bd create "Doctor Layout: Add top header bar with notifications and user dropdown" \
  -p 2 -l "frontend" -t task \
  -d "Doctor Layout has no header bar. Missing: user info display, notification bell, hamburger toggle for mobile, global search. Fix: Create top header bar component integrated with layout. Est: Medium."

bd create "Sidebar: Add full ARIA navigation attributes and keyboard navigation" \
  -p 2 -l "frontend" -t task \
  -d "DoctorSidebar has no ARIA attributes: missing role=navigation, aria-expanded, aria-label on nav items. No keyboard navigation support. Fix: Add proper ARIA roles, keyboard nav (arrow keys, enter/space). Est: Small."

bd create "StatCard: Add isLoading prop with built-in skeleton state" \
  -p 2 -l "frontend" -t task \
  -d "StatCard component (components/ui/stat-card.tsx) has no built-in loading state. Dashboard and list pages have to handle loading states separately. Some pages (Reports) use raw divs instead of StatCard. Fix: Add isLoading prop to StatCard. Est: Small."

bd create "Invoice detail: Add status change actions (Emettre, Marquer payee, Annuler)" \
  -p 2 -l "frontend" -t task \
  -d "Invoice detail page (invoices/[id]/page.tsx) has no actions beyond printing. Missing: status change workflow (Emettre, Marquer payee, Annuler), edit invoice (for drafts), create linked payment button, audit trail. Fix: Add status transition buttons with confirmation dialogs. Est: Medium."

bd create "Expenses list: Add date range picker to replace fixed current-month filter" \
  -p 2 -l "frontend" -t task \
  -d "Expenses list page (expenses/page.tsx) has date range fixed to current month with no date picker to change. Pagination shows no current page or total. KPIs computed client-side from current page only (inaccurate). Fix: Add date range picker component, fix pagination indicators, use server-side KPI aggregates. Est: Medium."

bd create "Documents list: Replace custom tabs with shadcn Tabs component" \
  -p 2 -l "frontend" -t task \
  -d "Documents list (documents/page.tsx) uses custom tab implementation instead of shadcn Tabs — lacks ARIA roles and keyboard navigation. Also: wire ?tab= query param to page state (currently ignored). Fix: Replace with shadcn Tabs, add ARIA tab roles, handle tab query param. Est: Small."

bd create "Medications list: Fix window.location.href navigation to use Next.js router" \
  -p 2 -l "frontend" -t bug \
  -d "Medications list page handleEdit uses window.location.href instead of Next.js router, causing full page reload on edit navigation. Also: KPI fetch retrieves 200 records client-side just for counts (should be dedicated endpoint). Fix: Use router.push(), create dedicated KPI endpoint. Est: Small."

bd create "KPI calculations: Move to server-side aggregates for Payments, Expenses, and Medications" \
  -p 2 -l "frontend,backend" -t task \
  -d "Multiple list pages compute KPI summaries client-side from paginated results only — producing inaccurate totals. Affected: Payments (computed from first 30 results), Expenses (computed from current page only), Medications (fetches 200 records for counts). Fix: Create/use dedicated server-side aggregate endpoints for KPI data. Est: Medium."

bd create "Forms: Standardize Invoices and Expenses forms on shadcn Form/FormField/FormMessage" \
  -p 2 -l "frontend" -t task \
  -d "New Invoice and New Expense forms use raw Label/Input instead of shadcn Form/FormField/FormMessage (inconsistent with other forms). Missing FormMessage components on several fields. Fix: Refactor to use consistent shadcn Form patterns, add FormMessage to all fields. Affected: invoices/new/page.tsx, expenses/new/page.tsx. Est: Medium."

bd create "Confirmation dialogs: Add AlertDialog for all destructive actions" \
  -p 2 -l "frontend" -t task \
  -d "GX-10: No AlertDialog usage anywhere. Delete hooks exist but are unused across multiple pages: useDeletePatient (patient detail), useDeletePrescription (prescription detail), useDeleteConsultation (consultation detail). No confirmation before any destructive action. Fix: Create delete confirmation patterns using shadcn AlertDialog, apply to all detail pages. Est: Medium."

bd create "Appointments: Add missing accessibility attributes to view toggle buttons" \
  -p 2 -l "frontend" -t task \
  -d "Appointments page view toggle buttons (calendar/list) lack accessibility attributes: no aria-label, aria-pressed, role=tab. Empty state has no illustration for calendar view, no 'New Appointment' CTA in list empty state. Fix: Add proper ARIA roles and states to toggle. Est: Small."

# ============================================================
# PHASE 4 — Low Priority (P3 Backlog)
# ============================================================

echo "--- Phase 4: P3 Backlog ---"

bd create "Unsaved changes guard: Create useUnsavedChanges hook for all form pages" \
  -p 3 -l "frontend" -t task \
  -d "GX-9: No beforeunload handler on any form page. Navigating away from dirty forms loses data silently. Affected: all new/edit pages (patients, consultations, prescriptions, certificates, payments, invoices, expenses, medications, reports, expertises). Fix: Create useUnsavedChanges hook with beforeunload + router event interception. Est: Small."

bd create "Patient detail: Replace img tag with next/image and fix non-functional buttons" \
  -p 3 -l "frontend" -t task \
  -d "Patient detail page (patients/[id]/page.tsx): uses raw <img> instead of next/image for photo. 'Nouvelle consultation' button has no onClick handler. Consent status not actionable (no button to record consent). Photo upload has no loading indicator. Fix: Use next/image, wire consultation button, add consent action. Est: Small."

bd create "Certificates new: Add auto-calculation of nombre_jours from date range" \
  -p 3 -l "frontend" -t task \
  -d "New Certificate form (certificates/new/page.tsx): nombre_jours auto-calculation missing (should compute from date_debut to date_fin). Also missing FormMessage on date_debut, date_fin, nombre_jours, date_certificat fields. Missing template system for pre-filling content by certificate type. Est: Small."

bd create "Reports: Use CSS variables for chart colors (dark mode support)" \
  -p 3 -l "frontend" -t task \
  -d "Reports page (reports/page.tsx): Pie chart colors are hardcoded hex values that won't adapt to dark mode. No loading indicator on 'Actualiser' button. useTopProcedures not bound to date range. PDF export has no loading state. Date formatting hardcoded to French locale. Fix: Use CSS variables for chart colors, add loading states. Est: Small."

bd create "Prescriptions new: Add medication autocomplete from database" \
  -p 3 -l "frontend" -t task \
  -d "New Prescription form: medication lines are free-text only, no autocomplete from the medications database. Would improve UX by suggesting existing medications with dosage info. Est: Medium."

bd create "Sidebar: Group navigation items into logical sections" \
  -p 3 -l "frontend" -t task \
  -d "DoctorSidebar nav items are a flat list with no grouping. Should be organized into sections: Main (Dashboard), Patients (Patients, Appointments, Consultations), Documents (Prescriptions, Certificates, Reports), Financial (Payments, Invoices, Expenses), Operations (Medications), Settings. Est: Small."

bd create "Extract shared constants: STATUT_LABELS, CATEGORY_LABELS, and Zod schemas" \
  -p 3 -l "frontend" -t chore \
  -d "Multiple duplication issues: STATUT_LABELS and STATUT_VARIANTS duplicated between invoices list and invoice detail. CATEGORY_LABELS slightly different between expenses list and form. Zod schema duplicated between medications new and edit pages. Fix: Extract to shared constants files and shared schema modules. Est: Small."

bd create "Documents: Wire ?tab= query param and fix redirect from new expertise" \
  -p 3 -l "frontend" -t bug \
  -d "Documents page ignores ?tab=expertises query parameter. New Expertise form redirects with ?tab=expertises but the documents page doesn't read it — always shows default tab. Also: contenu field is optional but no helper text explains why. Fix: Read and apply tab query param on documents page mount. Est: Small."

bd create "Consultation detail: Fix vital value falsy check hiding value 0" \
  -p 3 -l "frontend" -t bug \
  -d "Consultation detail page (consultations/[id]/page.tsx): Vital component treats 0 as falsy with 'if (!value)' — should be 'if (value == null)'. Also: Certificate detail page has same issue with nombre_jours falsy check hiding value 0. Fix: Use nullish checks instead of falsy checks for numeric values. Est: Small."

echo ""
echo "=== All beads created! ==="
echo ""
echo "Run 'bd list --label frontend' to see all frontend beads."
echo "Run 'bd sync' to sync with git."
