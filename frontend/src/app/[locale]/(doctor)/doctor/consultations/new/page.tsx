"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, User, Phone, Calendar, ShieldCheck } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ConsultationForm } from "@/components/consultations/consultation-form";
import { useCreateConsultation } from "@/hooks/use-consultations";
import { usePatient } from "@/hooks/use-patients";
import type { CreateConsultationPayload } from "@/types/consultation";

function PatientCard({ patientId }: { patientId: number }) {
  const { data: patient, isLoading } = usePatient(patientId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const age = patient.date_naissance
    ? differenceInYears(new Date(), new Date(patient.date_naissance))
    : null;

  const initials = patient.nom_complet
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
      {/* Avatar */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {initials}
      </div>

      {/* Name + dossier */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{patient.nom_complet}</p>
        <p className="font-mono text-xs text-primary">{patient.numero_dossier}</p>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {patient.telephone && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {patient.telephone}
          </span>
        )}
        {patient.date_naissance && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {format(new Date(patient.date_naissance), "dd/MM/yyyy", { locale: fr })}
            {age !== null && (
              <span className="ml-0.5 text-xs">({age} ans)</span>
            )}
          </span>
        )}
        {patient.genre && (
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            {patient.genre}
          </span>
        )}
        {patient.type_couverture && (
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            {patient.type_couverture}
          </span>
        )}
      </div>
    </div>
  );
}

export default function NewConsultationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const patientId = Number(params.get("patient_id") ?? 0);
  const appointmentId = params.get("appointment_id")
    ? Number(params.get("appointment_id"))
    : undefined;

  const createMutation = useCreateConsultation();
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | undefined>();

  function handleSubmit(values: CreateConsultationPayload) {
    setServerErrors(undefined);
    createMutation.mutate(values, {
      onSuccess: (c) => router.push(`/doctor/consultations/${c.id}`),
      onError: (error: unknown) => {
        const data = (error as { response?: { data?: { errors?: Record<string, string[]> } } })
          ?.response?.data;
        if (data?.errors) {
          setServerErrors(data.errors);
        }
      },
    });
  }

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">
          Un patient doit être sélectionné pour créer une consultation.
        </p>
        <Button
          variant="link"
          onClick={() => router.push("/doctor/patients")}
          className="mt-2"
        >
          Sélectionner un patient
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Nouvelle consultation</h1>
      </div>

      <PatientCard patientId={patientId} />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ConsultationForm
          patientId={patientId}
          appointmentId={appointmentId}
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          submitLabel="Enregistrer la consultation"
          serverErrors={serverErrors}
        />
      </div>
    </div>
  );
}
