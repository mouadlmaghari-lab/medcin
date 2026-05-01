"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientForm } from "@/components/patients/patient-form";
import { usePatient, useUpdatePatient } from "@/hooks/use-patients";
import type { UpdatePatientPayload } from "@/types/patient";

export default function AssistantEditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const numId = Number(id);

  const { data: patient, isLoading } = usePatient(numId);
  const updateMutation = useUpdatePatient(numId);

  function handleSubmit(values: UpdatePatientPayload) {
    updateMutation.mutate(values, {
      onSuccess: () => {
        router.push(`/assistant/patients/${id}`);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-[500px] animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground">Patient introuvable</p>
        <Button
          variant="link"
          onClick={() => router.push("/assistant/patients")}
          className="mt-2"
        >
          Retour à la liste
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
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Modifier — {patient.prenom} {patient.nom}
          </h1>
          <p className="font-mono text-sm text-primary">
            {patient.numero_dossier}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <PatientForm
          defaultValues={patient}
          onSubmit={handleSubmit}
          isPending={updateMutation.isPending}
          submitLabel="Mettre à jour"
        />
      </div>
    </div>
  );
}
