"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { differenceInDays, addDays, format, isValid, parseISO } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PatientCombobox } from "@/components/appointments/patient-combobox";
import { useCreateCertificate } from "@/hooks/use-certificates";
import type { Patient } from "@/types/patient";

type FormValues = {
  patient_id: number;
  type: "repos" | "aptitude" | "inapatitude" | "hospitalisation" | "custom";
  date_certificat: string;
  date_debut?: string;
  date_fin?: string;
  nombre_jours: number | null;
  contenu: string;
};

interface CertificateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: number;
  consultationId?: number | null;
}

function toDate(str: string | undefined): Date | null {
  if (!str) return null;
  const d = parseISO(str);
  return isValid(d) ? d : null;
}

export function CertificateFormModal({
  open,
  onOpenChange,
  patientId,
  consultationId,
}: CertificateFormModalProps) {
  const t = useTranslations("certificates");
  const tCommon = useTranslations("common");
  const createMutation = useCreateCertificate();
  const today = new Date().toISOString().split("T")[0];
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const needsDates = (type: string) =>
    type === "repos" || type === "hospitalisation";

  // Schema with cross-field date validation + conditional required fields
  const schema = z
    .object({
      patient_id: z
        .number({ required_error: t("validation.patientRequired") })
        .min(1, t("validation.patientRequired")),
      type: z.enum([
        "repos",
        "aptitude",
        "inapatitude",
        "hospitalisation",
        "custom",
      ]),
      date_certificat: z.string().min(1),
      date_debut: z.string().optional(),
      date_fin: z.string().optional(),
      nombre_jours: z.number().positive().nullable(),
      contenu: z.string().min(1, t("validation.contenuRequired")),
    })
    .superRefine((data, ctx) => {
      // Cross-field: end date must be after start date
      if (data.date_debut && data.date_fin) {
        const d1 = parseISO(data.date_debut);
        const d2 = parseISO(data.date_fin);
        if (isValid(d1) && isValid(d2) && differenceInDays(d2, d1) < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.endDateAfterStart"),
            path: ["date_fin"],
          });
        }
      }

      // Conditional required: end date + duration are mandatory for repos / hospitalisation
      if (needsDates(data.type)) {
        if (!data.date_fin) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.endDateRequired"),
            path: ["date_fin"],
          });
        }
        if (!data.nombre_jours || data.nombre_jours <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.durationRequired"),
            path: ["nombre_jours"],
          });
        }
      }
    });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: patientId ?? 0,
      type: "repos",
      date_certificat: today,
      date_debut: today,
      date_fin: "",
      nombre_jours: null,
      contenu: "",
    },
  });

  const type = form.watch("type");
  // Watch date_debut to derive the minimum selectable date_fin
  const dateDebut = form.watch("date_debut");
  const minDateFin =
    dateDebut && isValid(parseISO(dateDebut))
      ? format(addDays(parseISO(dateDebut), 1), "yyyy-MM-dd")
      : undefined;

  const placeholders: Record<string, string> = {
    repos: t("placeholderRest"),
    aptitude: t("placeholderAptitude"),
    inapatitude: t("placeholderDefault"),
    hospitalisation: t("placeholderDefault"),
    custom: t("placeholderDefault"),
  };

  // ── Date calculation helpers ──────────────────────────────────────────────

  /** debut + fin → nombre_jours */
  function calcJoursFromDates(
    debut: string | undefined,
    fin: string | undefined,
  ) {
    const d1 = toDate(debut);
    const d2 = toDate(fin);
    if (!d1 || !d2) return;
    const diff = differenceInDays(d2, d1);
    if (diff > 0) form.setValue("nombre_jours", diff, { shouldValidate: false });
  }

  /** debut + nombre_jours → fin */
  function calcFinFromJours(debut: string | undefined, jours: number | null) {
    const d1 = toDate(debut);
    if (!d1 || !jours || jours <= 0) return;
    form.setValue("date_fin", format(addDays(d1, jours), "yyyy-MM-dd"), {
      shouldValidate: false,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({ patient_id: patientId ?? 0, type: "repos", date_certificat: today, date_debut: today, date_fin: "", nombre_jours: null, contenu: "" });
      setSelectedPatient(null);
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit(values: FormValues) {
    createMutation.mutate(
      {
        patient_id: values.patient_id,
        consultation_id: consultationId ?? null,
        type: values.type,
        date_certificat: values.date_certificat,
        date_debut: values.date_debut || undefined,
        date_fin: values.date_fin || undefined,
        nombre_jours: values.nombre_jours ?? undefined,
        contenu: values.contenu,
      },
      {
        onSuccess: () => handleClose(false),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("modalTitle")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {!patientId && (
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("patientLabel")} *</FormLabel>
                    <FormControl>
                      <PatientCombobox
                        value={field.value || null}
                        selectedPatientName={selectedPatient?.nom_complet}
                        onChange={(id, patient) => {
                          field.onChange(id);
                          setSelectedPatient(patient);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("typeLabel")} *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="repos">{t("typeRest")}</SelectItem>
                        <SelectItem value="aptitude">
                          {t("typeAptitude")}
                        </SelectItem>
                        <SelectItem value="inapatitude">
                          {t("typeInapt")}
                        </SelectItem>
                        <SelectItem value="hospitalisation">
                          {t("typeHospitalization")}
                        </SelectItem>
                        <SelectItem value="custom">{t("typeCustom")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_certificat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dateLabel")} *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {(type === "repos" || type === "hospitalisation") && (
              <div className="grid gap-4 sm:grid-cols-3">
                {/* date_debut: if fin becomes invalid after change, clear fin+jours */}
                <FormField
                  control={form.control}
                  name="date_debut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("startDate")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          onChange={(e) => {
                            field.onChange(e);
                            const debut = e.target.value;
                            const fin = form.getValues("date_fin");
                            const jours = form.getValues("nombre_jours");
                            const d1 = toDate(debut);
                            const d2 = toDate(fin);
                            // If existing fin is now ≤ debut, clear it
                            if (d1 && d2 && differenceInDays(d2, d1) < 1) {
                              form.setValue("date_fin", "", {
                                shouldValidate: false,
                              });
                              form.setValue("nombre_jours", null, {
                                shouldValidate: false,
                              });
                              return;
                            }
                            if (fin) {
                              calcJoursFromDates(debut, fin);
                            } else if (jours) {
                              calcFinFromJours(debut, jours);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* date_fin: constrained by min=debut+1, recalculates nombre_jours */}
                <FormField
                  control={form.control}
                  name="date_fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("endDate")} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          min={minDateFin}
                          onChange={(e) => {
                            field.onChange(e);
                            calcJoursFromDates(
                              form.getValues("date_debut"),
                              e.target.value,
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* nombre_jours: recalculates date_fin from debut + days */}
                <FormField
                  control={form.control}
                  name="nombre_jours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("nombreJours")} *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const jours = e.target.value
                              ? Number(e.target.value)
                              : null;
                            field.onChange(jours);
                            calcFinFromJours(
                              form.getValues("date_debut"),
                              jours,
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="contenu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contenu")} *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      placeholder={placeholders[type] ?? t("placeholderDefault")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={createMutation.isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("issue")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
