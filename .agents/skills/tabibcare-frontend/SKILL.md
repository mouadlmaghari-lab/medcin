---
name: tabibcare-frontend
description: TabibCare project-specific frontend patterns, components, i18n conventions, and API integration. Use this skill on every frontend task to ensure consistency with existing codebase patterns. Contains the component library, hook patterns, translation structure, and coding conventions unique to this medical SaaS project.
license: MIT
metadata:
  author: tabibcare
  version: "1.0.0"
---

# TabibCare Frontend — Project Patterns & Conventions

Project-specific knowledge for the TabibCare medical practice management frontend.
Every frontend task MUST follow these patterns for consistency.

## File Structure

```
src/
  app/[locale]/(doctor)/doctor/   # Doctor pages (green theme)
  app/[locale]/(doctor)/layout.tsx # Doctor layout (sidebar + header + content)
  app/[locale]/(assistant)/       # Assistant pages (teal theme)
  app/[locale]/(auth)/            # Auth pages (login, register, reset)
  components/
    layouts/                       # DoctorSidebar, DoctorHeader, etc.
    ui/                            # Reusable shadcn/ui + custom components
    appointments/                  # Feature-specific components
    patients/
    consultations/
    ...
  hooks/                           # TanStack Query hooks (one file per module)
  types/                           # TypeScript interfaces (one file per module)
  lib/
    api.ts                         # Axios instance with auth interceptors
    utils.ts                       # cn() utility for Tailwind class merging
  store/
    auth.ts                        # Zustand auth store
  messages/
    en.json                        # English translations
    fr.json                        # French translations (default)
    ar.json                        # Arabic translations (RTL)
```

## i18n — Critical Conventions

### Rule: ZERO Hardcoded User-Facing Strings
Every string visible to users MUST go through `useTranslations()`. No exceptions.

### Namespace Structure
Translation files use flat namespaces. Each module has its own namespace:

```json
{
  "common": { "save": "...", "cancel": "...", "delete": "...", ... },
  "auth": { "login": "...", "password": "...", ... },
  "nav": { "dashboard": "...", "patients": "...", ... },
  "dashboard": { "title": "...", "welcomeMessage": "...", ... },
  "patients": { "title": "...", "newPatient": "...", ... },
  "appointments": { "title": "...", "newAppointment": "...", ... },
  "consultations": { ... },
  "prescriptions": { ... },
  "certificates": { ... },
  "payments": { ... },
  "expenses": { ... },
  "reports": { ... },
  "expertises": { ... },
  "settings": { ... }
}
```

### How to Add Translations
1. Add the key to ALL THREE files: `en.json`, `fr.json`, `ar.json`
2. Use camelCase keys: `"noAppointmentsToday"` not `"no_appointments_today"`
3. In components: `const t = useTranslations("appointments");` then `{t("title")}`
4. For multiple namespaces in one component, use multiple hooks:
   ```tsx
   const t = useTranslations("appointments");
   const tCommon = useTranslations("common");
   const tAuth = useTranslations("auth");
   ```
5. For toast messages in hooks (non-component), pass `t()` function as parameter or
   use the translations inline where the hook is called

### Locale-Aware Date Formatting
Use `date-fns` with dynamic locale based on app locale, NOT hardcoded:
```tsx
import { fr } from "date-fns/locale";
import { ar } from "date-fns/locale";
import { enUS } from "date-fns/locale";

// Get locale dynamically from next-intl
const locale = useLocale(); // "fr" | "en" | "ar"
const dateLocale = locale === "ar" ? ar : locale === "en" ? enUS : fr;
format(date, "EEE d MMM yyyy", { locale: dateLocale });
```

### FullCalendar Locale
Import the right FullCalendar locale dynamically:
```tsx
import frLocale from "@fullcalendar/core/locales/fr";
import arLocale from "@fullcalendar/core/locales/ar";
import enLocale from "@fullcalendar/core/locales/en-gb";
```

## Available UI Components

### shadcn/ui (installed)
| Component | Import Path | Key Props |
|---|---|---|
| Button | `@/components/ui/button` | `variant`: default/destructive/outline/secondary/ghost/link, `size`: default/sm/lg/icon, `asChild` |
| Card | `@/components/ui/card` | Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter |
| Dialog | `@/components/ui/dialog` | Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription |
| Input | `@/components/ui/input` | Standard input with Tailwind styling |
| Label | `@/components/ui/label` | For form labels |
| Select | `@/components/ui/select` | Select, SelectTrigger, SelectValue, SelectContent, SelectItem |
| Checkbox | `@/components/ui/checkbox` | Controlled checkbox |
| Textarea | `@/components/ui/textarea` | Multi-line input |
| Tabs | `@/components/ui/tabs` | Tabs, TabsList, TabsTrigger, TabsContent |
| Avatar | `@/components/ui/avatar` | Avatar (`size`: default/sm/lg), AvatarImage, AvatarFallback, AvatarBadge |
| Badge | `@/components/ui/badge` | Simple badge |
| Sheet | `@/components/ui/sheet` | Slide-over panel |
| DropdownMenu | `@/components/ui/dropdown-menu` | Context menus, action menus |
| Separator | `@/components/ui/separator` | HR-like divider |
| Popover | `@/components/ui/popover` | Floating content |
| Table | `@/components/ui/table` | HTML table with styles |
| Command | `@/components/ui/command` | cmdk palette |
| Calendar | `@/components/ui/calendar` | Date picker calendar |
| Form | `@/components/ui/form` | React Hook Form integration: Form, FormField, FormItem, FormLabel, FormControl, FormMessage |
| Sonner | `@/components/ui/sonner` | Toast notifications via `toast.success()`, `toast.error()` |

### Custom Reusable Components
| Component | Import Path | Props | Usage |
|---|---|---|---|
| PageHeader | `@/components/ui/page-header` | `title`, `description?`, `actions?`, `className?` | Page title + action buttons area |
| DataTable | `@/components/ui/data-table` | `columns: Column<T>[]`, `data: T[]`, `keyExtractor`, `isLoading?`, `emptyState?`, `onRowClick?` | Generic data table |
| StatusBadge | `@/components/ui/status-badge` | `label`, `variant`: confirmed/pending/cancelled/completed/noshow/default | Colored status badges |
| EmptyState | `@/components/ui/empty-state` | `icon?: LucideIcon`, `title`, `description?`, `action?` | Empty/no-data placeholders |
| StatCard | `@/components/ui/stat-card` | `label`, `value`, `icon?`, `trend?: { value, label }` | KPI cards |

### DataTable Column Definition
```tsx
import { type Column } from "@/components/ui/data-table";

const columns: Column<MyType>[] = [
  {
    key: "name",
    header: t("name"),  // ALWAYS translated
    cell: (row) => <span>{row.name}</span>,
    className?: "w-48",
    headerClassName?: "text-center",
  },
];
```

## Hook Patterns (TanStack Query v5)

### Query Key Factory
Every module follows this pattern:
```tsx
export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params: object) => ["appointments", "list", params] as const,
  detail: (id: number) => ["appointments", id] as const,
  calendar: (start: string, end: string) =>
    ["appointments", "calendar", start, end] as const,
};
```

### List Hook with Filters
```tsx
export function useAppointments(params: { ... }) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<ResponseType>("/doctor/appointments", { params });
      return data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
```

### Mutation Hook Pattern
```tsx
export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const { data } = await api.post<{ data: Type }>("/doctor/appointments", payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success(/* MUST be translated */);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? /* translated fallback */;
      toast.error(msg);
    },
  });
}
```

### Important: Toast Messages in Hooks
Hooks like `use-appointments.ts` currently have hardcoded French toast messages.
The correct pattern is to either:
1. Accept a translations object as parameter
2. Move toast calls to the component that calls `mutate()`
3. Use `onSuccess`/`onError` callbacks at call site:
```tsx
createMutation.mutate(values, {
  onSuccess: () => { toast.success(t("created")); setCreateOpen(false); },
  onError: () => { toast.error(t("createError")); },
});
```

## Form Patterns (React Hook Form + Zod)

### Standard Form Layout
```tsx
const schema = z.object({
  patient_id: z.number({ required_error: t("validation.patientRequired") }).positive(),
  date: z.string().min(1, t("validation.dateRequired")),
  // ... all error messages MUST be translated
});

// 2-column grid for compact forms
<div className="grid gap-4 sm:grid-cols-2">
  <FormField ... />
  <FormField ... />
</div>

// Full-width for text areas
<FormField name="notes" ... />

// Actions at bottom-right
<div className="flex justify-end gap-3 pt-2">
  <Button variant="outline" onClick={onCancel}>{tCommon("cancel")}</Button>
  <Button type="submit" disabled={isPending}>{submitLabel}</Button>
</div>
```

### Patient Selector Pattern
When a form needs a patient_id, use a searchable combobox:
```tsx
// Use Command (cmdk) or a custom PatientSearch component
// that queries usePatients({ search: debouncedQuery })
```

## API Integration

### Base URL
`http://localhost:8000/api/v1` (configurable via `NEXT_PUBLIC_API_URL`)

### Auth Token
Stored in `localStorage` as `tabibcare_token`, attached via Axios interceptor.

### API Response Shapes
```tsx
// List endpoint
{ data: T[], meta: { current_page, last_page, total, per_page } }

// Single endpoint
{ data: T }

// Create/Update endpoint
{ data: T, message: string }

// Error (422 validation)
{ message: string, errors: { [field]: string[] } }

// Error (403/404)
{ message: string }
```

### Doctor API Endpoints
All prefixed with `/doctor/`:
- GET/POST `/doctor/appointments`
- GET/PUT/DELETE `/doctor/appointments/{id}`
- PATCH `/doctor/appointments/{id}/status`
- PATCH `/doctor/appointments/{id}/cancel`
- GET/POST `/doctor/patients`
- GET/POST `/doctor/consultations`
- GET/POST `/doctor/prescriptions`
- GET/POST `/doctor/certificates`
- GET/POST `/doctor/payments`
- GET/POST `/doctor/expenses`
- GET `/doctor/reports`
- GET/POST `/doctor/expertises`
- GET/PUT `/doctor/settings`

## Layout Structure

### Doctor Layout (`(doctor)/layout.tsx`)
```
┌─────────────────────────────────────────┐
│ Sidebar │ Header (DoctorHeader)         │
│ (w-64)  │───────────────────────────────│
│         │ Content (scrollable)          │
│         │   <div className="p-6">       │
│         │     {children}                │
│         │   </div>                      │
│         │                               │
└─────────────────────────────────────────┘
```

- **DoctorSidebar**: 10 nav items + bottom section (notifications, settings, user, logout)
- **DoctorHeader**: Dynamic page title from URL segment + notification bell + avatar
- Content area: `overflow-y-auto` with `p-6` padding

### Page Pattern
Since DoctorHeader already shows the page title, pages should use PageHeader
only when they need action buttons (like "New" CTA or view toggles).
Consider whether the PageHeader title duplicates the DoctorHeader title.

## Common Patterns to Avoid

### NEVER Do These
1. Hardcode any user-facing string — use `t()` from `useTranslations()`
2. Import barrel files — import specific components directly
3. Use `useEffect` + `fetch` — use TanStack Query
4. Hardcode `locale: fr` in date-fns — make it dynamic
5. Fire API queries for invisible views — use `enabled` option
6. Forget to update all 3 translation files (en, fr, ar)
7. Use Zod error messages without translations
8. Use `"yyyy-MM-28"` to get month end — use `endOfMonth()` from date-fns

## Existing Module Files Reference

| Module | Page | Components | Hook | Types |
|---|---|---|---|---|
| Appointments | `doctor/appointments/page.tsx` | `appointments/calendar-view.tsx`, `appointments/appointment-form.tsx` | `use-appointments.ts` | `appointment.ts` |
| Patients | `doctor/patients/page.tsx` | — | `use-patients.ts` | `patient.ts` |
| Consultations | `doctor/consultations/page.tsx` | — | `use-consultations.ts` | `consultation.ts` |
| Prescriptions | `doctor/prescriptions/page.tsx` | — | `use-prescriptions.ts` | `prescription.ts` |
| Certificates | `doctor/certificates/page.tsx` | — | `use-certificates.ts` | `certificate.ts` |
| Payments | `doctor/payments/page.tsx` | — | `use-payments.ts` | `payment.ts` |
