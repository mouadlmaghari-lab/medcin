"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientForm } from "@/components/patients/patient-form";
import { useCreatePatient } from "@/hooks/use-patients";
import type { CreatePatientPayload } from "@/types/patient";

export default function AssistantNewPatientPage() {
  const router = useRouter();
  const createMutation = useCreatePatient();

  function handleSubmit(values: CreatePatientPayload) {
    createMutation.mutate(values, {
      onSuccess: (patient) => {
        router.push(`/assistant/patients/${patient.id}`);
      },
    });
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
          <h1 className="text-xl font-bold tracking-tight">Nouveau patient</h1>
          <p className="text-sm text-muted-foreground">
            Créer une nouvelle fiche patient
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <PatientForm
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          submitLabel="Créer le patient"
        />
      </div>
    </div>
  );
}
