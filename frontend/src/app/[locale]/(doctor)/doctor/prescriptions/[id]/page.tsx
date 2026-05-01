"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrescription } from "@/hooks/use-prescriptions";
import api from "@/lib/api";
import { toast } from "sonner";

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: prescription, isLoading } = usePrescription(Number(id));

  async function handlePrintPDF() {
    try {
      const resp = await api.get(`/doctor/pdf/ordonnance/${id}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(resp.data as Blob);
      window.open(url, "_blank");
    } catch {
      toast.error("Impossible de générer le PDF");
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (!prescription) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Ordonnance introuvable
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
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
            <h1 className="text-xl font-bold tracking-tight">Ordonnance</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(prescription.date_ordonnance), "dd MMMM yyyy", {
                locale: fr,
              })}
              {prescription.patient && ` · ${prescription.patient.nom_complet}`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrintPDF}>
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          Imprimer PDF
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b p-5">
          {prescription.patient && (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {prescription.patient.nom_complet}
                </p>
                <p className="font-mono text-sm text-primary">
                  {prescription.patient.numero_dossier}
                </p>
                {prescription.patient.date_naissance && (
                  <p className="text-sm text-muted-foreground">
                    Né(e) le{" "}
                    {format(
                      new Date(prescription.patient.date_naissance),
                      "dd/MM/yyyy",
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Medications */}
        <div className="divide-y">
          {prescription.items.map((item, i) => (
            <div key={i} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.medication_name}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {item.dosage && <span>Dosage: {item.dosage}</span>}
                    {item.dosage && item.frequence && <span>·</span>}
                    {item.frequence && <span>Fréquence: {item.frequence}</span>}
                    {item.frequence && item.duree && <span>·</span>}
                    {item.duree && <span>Durée: {item.duree}</span>}
                  </div>
                  {item.instructions && (
                    <p className="mt-1 text-sm italic text-muted-foreground">
                      {item.instructions}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  #{i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

        {prescription.notes && (
          <div className="border-t bg-muted/20 p-5">
            <p className="text-sm font-medium">Notes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {prescription.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
