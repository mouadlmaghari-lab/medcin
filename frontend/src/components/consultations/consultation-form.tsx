"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PatientCombobox } from "@/components/appointments/patient-combobox";
import type { Consultation, CreateConsultationPayload } from "@/types/consultation";

// ── Validation Schema ──────────────────────────────────────────────────────────
//
// MIRRORS: backend StoreConsultationRequest
//          + GET /api/v1/doctor/consultations/validation-rules
//
// Rule: Every constraint here must match the backend exactly. If you add or
// change a field, update the backend FormRequest FIRST, then mirror it here.
// Field names must be 1:1 with the backend — no aliases, no renaming.
//
// NumericInput converts "" → null and "3.5" → Number(3.5) before Zod runs,
// so we use z.number() (not z.coerce) for all numeric fields.
// z.number().min(X).max(Y).nullable() correctly:
//   • accepts null  (empty field)
//   • rejects numbers outside [X, Y]
//   • accepts numbers in [X, Y]
// ──────────────────────────────────────────────────────────────────────────────

export const consultationSchema = z.object({
  // ── Core ──────────────────────────────────────────────────────────────────
  patient_id: z
    .number({
      required_error: "Le patient est obligatoire.",
      invalid_type_error: "Le patient est obligatoire.",
    })
    .int()
    .positive("Le patient est obligatoire."),

  appointment_id: z.number().int().positive().nullable().optional(),

  date_consultation: z
    .string()
    .min(1, "La date de consultation est obligatoire."),

  // ── Vitals ────────────────────────────────────────────────────────────────
  poids: z.number().min(0).max(500).nullable(),

  taille: z.number().int().min(0).max(300).nullable(),

  temperature: z
    .number()
    .min(30, "La température minimum est 30°C.")
    .max(45, "La température ne peut pas dépasser 45°C.")
    .nullable(),

  tension_systolique: z
    .number()
    .int()
    .min(0)
    .max(300, "La tension systolique ne peut pas dépasser 300 mmHg.")
    .nullable(),

  tension_diastolique: z
    .number()
    .int()
    .min(0)
    .max(200, "La tension diastolique ne peut pas dépasser 200 mmHg.")
    .nullable(),

  saturation_o2: z
    .number()
    .min(0)
    .max(100, "La saturation O2 ne peut pas dépasser 100%.")
    .nullable(),

  frequence_cardiaque: z.number().int().min(0).max(300).nullable(),

  frequence_respiratoire: z
    .number()
    .int()
    .min(0)
    .max(60, "La fréquence respiratoire ne peut pas dépasser 60/min.")
    .nullable(),

  // ── Bilan glycémique ──────────────────────────────────────────────────────
  glycemie: z.number().min(0).nullable(),
  glycemie_a_jeun: z.number().min(0).nullable(),
  glycemie_apres_repas: z.number().min(0).nullable(),

  hba1c: z
    .number()
    .min(0)
    .max(20, "L'HbA1c ne peut pas dépasser 20%.")
    .nullable(),

  glucagon: z.number().min(0).nullable(),

  // Enum values must exactly match backend: ["-", "+", "++", "+++"]
  glucosurie: z.enum(["-", "+", "++", "+++"]).nullable(),
  acetone: z.enum(["-", "+", "++", "+++"]).nullable(),

  // ── Paramètres spéciaux ───────────────────────────────────────────────────
  tt: z.number().nullable(),
  th: z.number().nullable(),
  glogylie: z.string().max(500).nullable(),

  // ── Bilan lipidique ───────────────────────────────────────────────────────
  cholesterol_total: z.number().min(0).nullable(),
  triglycerides: z.number().min(0).nullable(),
  hdl: z.number().min(0).nullable(),
  ldl: z.number().min(0).nullable(),

  // ── Examen clinique & diagnostic ──────────────────────────────────────────
  examen_clinique: z.string().nullable(),
  diagnostic: z.string().nullable(),
  conduite_a_tenir: z.string().nullable(),

  // ── Règlement ─────────────────────────────────────────────────────────────
  // NOTE: prix has no form control in this form (managed separately).
  // Use .nullish() so RHF's undefined (unregistered field) doesn't
  // trigger "expected number, received undefined" from Zod.
  prix: z.number().min(0).nullish(),
  regle: z.boolean().optional(),
});

export type ConsultationFormValues = z.infer<typeof consultationSchema>;

// ── NumericInput helper ────────────────────────────────────────────────────────
// Converts "" → null and string → Number before React Hook Form / Zod see it.
// This means Zod always receives `number | null`, never a raw string.
function NumericInput({
  field,
  placeholder,
  unit,
  step = "0.1",
}: {
  field: { value: number | null; onChange: (v: number | null) => void; name: string };
  placeholder?: string;
  unit?: string;
  step?: string;
}) {
  return (
    <div className="relative">
      <Input
        type="number"
        step={step}
        value={field.value ?? ""}
        onChange={(e) =>
          field.onChange(
            e.target.value === "" ? null : Number(e.target.value),
          )
        }
        placeholder={placeholder}
        className={unit ? "pr-10" : ""}
      />
      {unit && (
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
          {unit}
        </span>
      )}
    </div>
  );
}

// ── toNum helper ───────────────────────────────────────────────────────────────
// Laravel returns decimal/numeric columns as strings (e.g. "75.5" not 75.5).
// Convert to number, or null for empty/null/undefined values.
function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface ConsultationFormProps {
  patientId?: number;
  appointmentId?: number;
  defaultValues?: Partial<Consultation>;
  onSubmit: (values: CreateConsultationPayload) => void;
  onCancel?: () => void;
  isPending: boolean;
  submitLabel?: string;
  serverErrors?: Record<string, string[]>;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function ConsultationForm({
  patientId,
  appointmentId,
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = "Enregistrer",
  serverErrors,
}: ConsultationFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      patient_id: patientId ?? 0,
      appointment_id: toNum(appointmentId ?? defaultValues?.appointment_id),
      date_consultation: defaultValues?.date_consultation ?? today,
      // Vitals — toNum handles API strings like "75.5" → 75.5
      poids: toNum(defaultValues?.poids),
      taille: toNum(defaultValues?.taille),
      tension_systolique: toNum(defaultValues?.tension_systolique),
      tension_diastolique: toNum(defaultValues?.tension_diastolique),
      temperature: toNum(defaultValues?.temperature),
      saturation_o2: toNum(defaultValues?.saturation_o2),
      frequence_cardiaque: toNum(defaultValues?.frequence_cardiaque),
      frequence_respiratoire: toNum(defaultValues?.frequence_respiratoire),
      // Bilan glycémique
      glycemie: toNum(defaultValues?.glycemie),
      glycemie_a_jeun: toNum(defaultValues?.glycemie_a_jeun),
      glycemie_apres_repas: toNum(defaultValues?.glycemie_apres_repas),
      hba1c: toNum(defaultValues?.hba1c),
      glucagon: toNum(defaultValues?.glucagon),
      glucosurie: defaultValues?.glucosurie ?? null,
      acetone: defaultValues?.acetone ?? null,
      // Paramètres spéciaux
      tt: toNum(defaultValues?.tt),
      th: toNum(defaultValues?.th),
      glogylie: defaultValues?.glogylie ?? null,
      // Lipides
      cholesterol_total: toNum(defaultValues?.cholesterol_total),
      triglycerides: toNum(defaultValues?.triglycerides),
      hdl: toNum(defaultValues?.hdl),
      ldl: toNum(defaultValues?.ldl),
      // Clinical
      examen_clinique: defaultValues?.examen_clinique ?? null,
      diagnostic: defaultValues?.diagnostic ?? null,
      conduite_a_tenir: defaultValues?.conduite_a_tenir ?? null,
      // Règlement
      prix: toNum(defaultValues?.prix),
      regle: defaultValues?.regle ?? false,
    },
  });

  // Map backend validation errors onto form fields (fallback for any edge cases
  // that slip past the frontend Zod schema)
  useEffect(() => {
    if (!serverErrors) return;
    for (const [field, messages] of Object.entries(serverErrors)) {
      form.setError(field as keyof ConsultationFormValues, {
        type: "server",
        message: messages[0],
      });
    }
  }, [serverErrors, form]);

  function handleSubmit(values: ConsultationFormValues) {
    onSubmit(values as CreateConsultationPayload);
  }

  // Live IMC calculation
  const poids = form.watch("poids");
  const taille = form.watch("taille");
  const imc =
    poids && taille && taille > 0
      ? (poids / (taille / 100) ** 2).toFixed(1)
      : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

        {/* ── Patient (only when not pre-selected) ── */}
        {!patientId && (
          <>
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient *</FormLabel>
                  <FormControl>
                    <PatientCombobox
                      value={field.value || null}
                      onChange={(id) => field.onChange(id)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
          </>
        )}

        {/* ── Date consultation ─────────────────── */}
        <FormField
          control={form.control}
          name="date_consultation"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <FormLabel>Date de consultation *</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* ── Constantes vitales ────────────────── */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Constantes vitales
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="poids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="kg"
                      step="0.1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taille"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taille</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="cm"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── IMC (read-only, calculated) ── */}
            <FormItem>
              <FormLabel>I.M.C</FormLabel>
              <div className="relative">
                <Input
                  readOnly
                  value={imc ?? ""}
                  placeholder="—"
                  className="bg-muted/50 pr-14 text-muted-foreground"
                />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
                  kg/m²
                </span>
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="tension_systolique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TA Systolique</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="mmHg"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tension_diastolique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TA Diastolique</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="mmHg"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequence_cardiaque"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréq. cardiaque</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="bpm"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Température</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="°C"
                      step="0.1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saturation_o2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saturation O₂</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="%"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequence_respiratoire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréq. respiratoire</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="/min"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        {/* ── Bilan glycémique ──────────────────── */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Bilan glycémique
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* glycemie — current blood glucose, added to match backend */}
            <FormField
              control={form.control}
              name="glycemie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glycémie</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="g/L"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="glycemie_a_jeun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glycémie à jeun</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="g/L"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="glycemie_apres_repas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glycémie après repas</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="g/L"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hba1c"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HbA1c</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="%"
                      step="0.1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* glucagon — added to match backend */}
            <FormField
              control={form.control}
              name="glucagon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glucagon</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="ng/mL"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="glucosurie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glucosurie</FormLabel>
                  {/* Values must match backend enum: ["-", "+", "++", "+++"] */}
                  {/* Use value= (controlled) not defaultValue= so edits re-render correctly */}
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                    value={field.value ?? "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      <SelectItem value="-">Négatif</SelectItem>
                      <SelectItem value="+">+</SelectItem>
                      <SelectItem value="++">++</SelectItem>
                      <SelectItem value="+++">+++</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acetone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acétonurie</FormLabel>
                  {/* Values must match backend enum: ["-", "+", "++", "+++"] */}
                  {/* Use value= (controlled) not defaultValue= so edits re-render correctly */}
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                    value={field.value ?? "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      <SelectItem value="-">Négatif</SelectItem>
                      <SelectItem value="+">+</SelectItem>
                      <SelectItem value="++">++</SelectItem>
                      <SelectItem value="+++">+++</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>T.T</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="cm"
                      step="0.1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="th"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>T.H</FormLabel>
                  <FormControl>
                    <NumericInput
                      field={field as Parameters<typeof NumericInput>[0]["field"]}
                      unit="g/L"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* glogylie — added to match backend */}
            <FormField
              control={form.control}
              name="glogylie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glogylie</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      maxLength={500}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        {/* ── Bilan lipidique ───────────────────── */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Bilan lipidique
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { name: "cholesterol_total", label: "Cholestérol total" },
                { name: "triglycerides", label: "Triglycérides" },
                { name: "hdl", label: "HDL" },
                { name: "ldl", label: "LDL" },
              ] as const
            ).map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <NumericInput
                        field={field as Parameters<typeof NumericInput>[0]["field"]}
                        unit="g/L"
                        step="0.01"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Examen & Diagnostic ───────────────── */}
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Examen physique & Diagnostic
          </h3>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="examen_clinique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Examen physique</FormLabel>
                  <FormControl>
                    <Textarea
                      {...(field as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      rows={4}
                      placeholder="Findings..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diagnostic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnostic</FormLabel>
                  <FormControl>
                    <Textarea
                      {...(field as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      rows={2}
                      placeholder="Diagnostic principal..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="conduite_a_tenir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conduite à tenir</FormLabel>
                  <FormControl>
                    <Textarea
                      {...(field as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      rows={3}
                      placeholder="Plan de traitement..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel ? onCancel() : window.history.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
