"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";
import {
  ArrowLeft,
  FileText,
  Printer,
  Pencil,
  CheckCircle2,
  XCircle,
  Pill,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConsultation, useUpdateConsultation } from "@/hooks/use-consultations";
import { ConsultationForm } from "@/components/consultations/consultation-form";
import type { CreateConsultationPayload } from "@/types/consultation";
import { toast } from "sonner";
import api from "@/lib/api";

// ── IMC category ───────────────────────────────────────────────────────────────
function getImcInfo(
  imc: number,
  t: (key: string) => string,
): { label: string; colorClass: string } {
  if (imc < 18.5) return { label: t("detail.bmiUnderweight"), colorClass: "text-blue-600" };
  if (imc < 25)   return { label: t("detail.bmiNormal"),      colorClass: "text-green-600" };
  if (imc < 30)   return { label: t("detail.bmiOverweight"),  colorClass: "text-amber-600" };
  return            { label: t("detail.bmiObese"),           colorClass: "text-red-600" };
}

// ── Vital card ─────────────────────────────────────────────────────────────────
// FIX (Medcin-1eg): use `value == null` instead of `!value` to avoid hiding 0.
function Vital({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null | undefined;
  unit?: string;
}) {
  if (value == null) return null;
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
        )}
      </p>
    </div>
  );
}

// ── Lipid row ──────────────────────────────────────────────────────────────────
function LipidRow({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  if (value == null) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value} g/L</span>
    </div>
  );
}

// ── Glycemic field ─────────────────────────────────────────────────────────────
const GLYCEMIC_ENUM_VALUES = new Set(["-", "+", "++", "+++"]);

function GlycemicField({
  label,
  value,
  unit,
  negativeLabel,
}: {
  label: string;
  value: number | string | null | undefined;
  unit?: string;
  negativeLabel?: string;
}) {
  if (value == null) return null;

  let display: string;
  if (typeof value === "string" && GLYCEMIC_ENUM_VALUES.has(value)) {
    // Enum field (glucosurie, acetone): replace "-" with translated "Négatif"
    display = value === "-" && negativeLabel ? negativeLabel : value;
  } else {
    // Numeric field — value may arrive as number OR decimal string from API
    display = unit ? `${value} ${unit}` : String(value);
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold">{display}</p>
    </div>
  );
}

// ── Page skeleton ──────────────────────────────────────────────────────────────
function ConsultationDetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-52 rounded bg-muted" />
            <div className="h-3.5 w-32 rounded bg-muted" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-md bg-muted" />
          <div className="h-8 w-20 rounded-md bg-muted" />
          <div className="h-8 w-28 rounded-md bg-muted" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="h-36 rounded-lg bg-muted" />
          <div className="h-24 rounded-lg bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-lg bg-muted" />
          <div className="h-28 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("consultations");
  const tCommon = useTranslations("common");

  const [editOpen, setEditOpen] = useState(false);

  const { data: c, isLoading } = useConsultation(Number(id));
  const updateMutation = useUpdateConsultation(Number(id));

  const dateLocale = locale === "ar" ? ar : locale === "en" ? enUS : fr;

  async function handlePrint() {
    try {
      const resp = await api.get(`/doctor/pdf/consultation/${id}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(resp.data as Blob);
      window.open(url, "_blank");
    } catch {
      toast.error(t("detail.pdfError"));
    }
  }

  const handleEditSubmit = useCallback(
    (values: CreateConsultationPayload) => {
      updateMutation.mutate(values, {
        onSuccess: () => setEditOpen(false),
      });
    },
    [updateMutation],
  );

  if (isLoading) return <ConsultationDetailSkeleton />;

  if (!c) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        {t("detail.notFound")}
      </div>
    );
  }

  // Derived values
  const imc =
    c.poids != null && c.taille != null && c.taille > 0
      ? c.poids / (c.taille / 100) ** 2
      : null;
  const imcInfo = imc != null ? getImcInfo(imc, t) : null;

  const hasGlycemic =
    c.glycemie != null ||
    c.glycemie_a_jeun != null ||
    c.glycemie_apres_repas != null ||
    c.hba1c != null ||
    c.glucagon != null ||
    c.glucosurie != null ||
    c.acetone != null;

  const hasSpecialParams = c.tt != null || c.th != null || c.glogylie != null;

  const hasLipid =
    c.cholesterol_total != null ||
    c.triglycerides != null ||
    c.hdl != null ||
    c.ldl != null;

  const hasBloodPressure =
    c.tension_systolique != null && c.tension_diastolique != null;

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {t("detail.consultationOf", {
                  date: format(new Date(c.date_consultation), "dd MMMM yyyy", {
                    locale: dateLocale,
                  }),
                })}
              </h1>
              {/* Prescriptions count badge */}
              {(c.prescriptions_count ?? 0) > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-xs"
                  title={t("detail.prescriptions")}
                >
                  <Pill className="h-3 w-3" />
                  {c.prescriptions_count}
                </Badge>
              )}
              {/* Certificates count badge */}
              {(c.certificates_count ?? 0) > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-xs"
                  title={t("detail.certificates")}
                >
                  <Award className="h-3 w-3" />
                  {c.certificates_count}
                </Badge>
              )}
            </div>
            {c.patient && (
              <p className="text-sm text-muted-foreground">
                {c.patient.nom_complet} · {c.patient.numero_dossier}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {tCommon("edit")}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            PDF
          </Button>
          <Button
            size="sm"
            onClick={() =>
              router.push(
                `/doctor/prescriptions/new?consultation_id=${c.id}&patient_id=${c.patient_id}`,
              )
            }
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            {t("detail.ordonnance")}
          </Button>
        </div>
      </div>

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t("detail.editConsultation")}</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="p-1">
              <ConsultationForm
                patientId={c.patient_id}
                defaultValues={c}
                onSubmit={handleEditSubmit}
                isPending={updateMutation.isPending}
                submitLabel={tCommon("save")}
                onCancel={() => setEditOpen(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Content grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main — clinical notes */}
        <div className="space-y-5 lg:col-span-2">
          {/* Examen clinique */}
          {c.examen_clinique && (
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold">{t("detail.clinicalExam")}</h3>
              <p className="whitespace-pre-wrap text-sm">{c.examen_clinique}</p>
            </div>
          )}

          {/* Diagnostic + Conduite à tenir */}
          {(c.diagnostic || c.conduite_a_tenir) && (
            <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
              {c.diagnostic && (
                <div>
                  <h3 className="mb-1 text-sm font-semibold">{t("detail.diagnosis")}</h3>
                  <p className="whitespace-pre-wrap text-sm">{c.diagnostic}</p>
                </div>
              )}
              {c.conduite_a_tenir && (
                <div>
                  <h3 className="mb-1 text-sm font-semibold">{t("detail.conductTaken")}</h3>
                  <p className="whitespace-pre-wrap text-sm">{c.conduite_a_tenir}</p>
                </div>
              )}
            </div>
          )}

          {/* Empty state when no clinical notes recorded yet */}
          {!c.examen_clinique && !c.diagnostic && !c.conduite_a_tenir && (
            <div className="flex items-center justify-center rounded-lg border border-dashed py-12">
              <p className="text-sm text-muted-foreground">{t("detail.noClinicalNotes")}</p>
            </div>
          )}
        </div>

        {/* Sidebar — measurements & labs */}
        <div className="space-y-4">
          {/* Constantes vitales */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">{t("detail.vitals")}</h3>
            <div className="grid grid-cols-2 gap-2">
              <Vital label={t("detail.weight")} value={c.poids} unit="kg" />
              <Vital label={t("detail.height")} value={c.taille} unit="cm" />
              {hasBloodPressure && (
                <div className="col-span-2 rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">{t("detail.bloodPressure")}</p>
                  <p className="mt-1 text-xl font-bold">
                    {c.tension_systolique}/{c.tension_diastolique}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      mmHg
                    </span>
                  </p>
                </div>
              )}
              <Vital label={t("detail.heartRate")} value={c.frequence_cardiaque} unit="bpm" />
              <Vital label={t("detail.temperature")} value={c.temperature} unit="°C" />
              <Vital label="SpO₂" value={c.saturation_o2} unit="%" />
              <Vital label={t("detail.respiratoryRate")} value={c.frequence_respiratoire} unit="/min" />
            </div>
          </div>

          {/* IMC with WHO category */}
          {imc != null && (
            <div className="rounded-lg border bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground">{t("detail.bmiCalculated")}</p>
              <p className="text-2xl font-bold">{imc.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kg/m²</p>
              {imcInfo && (
                <p className={`mt-1 text-xs font-semibold ${imcInfo.colorClass}`}>
                  {imcInfo.label}
                </p>
              )}
            </div>
          )}

          {/* Bilan glycémique — all 7 fields */}
          {hasGlycemic && (
            <div className="rounded-lg border bg-amber-50 p-4 shadow-sm dark:bg-amber-900/10">
              <h3 className="mb-3 text-sm font-semibold">{t("detail.glycemicPanel")}</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <GlycemicField
                  label={t("detail.glycemia")}
                  value={c.glycemie}
                  unit="g/L"
                />
                <GlycemicField
                  label={t("detail.fastingGlycemia")}
                  value={c.glycemie_a_jeun}
                  unit="g/L"
                />
                <GlycemicField
                  label={t("detail.postMealGlycemia")}
                  value={c.glycemie_apres_repas}
                  unit="g/L"
                />
                <GlycemicField label="HbA1c" value={c.hba1c} unit="%" />
                <GlycemicField label="Glucagon" value={c.glucagon} unit="ng/mL" />
                <GlycemicField
                  label={t("detail.glucosuria")}
                  value={c.glucosurie}
                  negativeLabel={t("detail.negative")}
                />
                <GlycemicField
                  label={t("detail.acetonuria")}
                  value={c.acetone}
                  negativeLabel={t("detail.negative")}
                />
              </div>
            </div>
          )}

          {/* Paramètres spéciaux */}
          {hasSpecialParams && (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold">{t("detail.specialParams")}</h3>
              <div className="space-y-1.5 text-sm">
                {c.tt != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">T.T</span>
                    <span className="font-medium">{c.tt} cm</span>
                  </div>
                )}
                {c.th != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">T.H</span>
                    <span className="font-medium">{c.th} g/L</span>
                  </div>
                )}
                {c.glogylie && (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0 text-muted-foreground">Glogylie</span>
                    <span className="text-right font-medium">{c.glogylie}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bilan lipidique */}
          {hasLipid && (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold">{t("detail.lipidPanel")}</h3>
              <div className="space-y-1.5">
                <LipidRow label={t("detail.totalCholesterol")} value={c.cholesterol_total} />
                <LipidRow label={t("detail.triglycerides")} value={c.triglycerides} />
                <LipidRow label="HDL" value={c.hdl} />
                <LipidRow label="LDL" value={c.ldl} />
              </div>
            </div>
          )}

          {/* Règlement */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">{t("detail.payment")}</h3>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {c.prix != null ? `${c.prix} MAD` : "—"}
              </span>
              <Badge
                variant="outline"
                className={
                  c.regle
                    ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20"
                    : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20"
                }
              >
                {c.regle ? (
                  <>
                    <CheckCircle2 className="me-1 h-3 w-3" />
                    {t("detail.paid")}
                  </>
                ) : (
                  <>
                    <XCircle className="me-1 h-3 w-3" />
                    {t("detail.unpaid")}
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
