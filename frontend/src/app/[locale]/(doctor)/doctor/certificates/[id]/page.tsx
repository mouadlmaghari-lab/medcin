"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCertificate } from "@/hooks/use-certificates";
import api from "@/lib/api";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  repos: "Certificat de repos médical",
  aptitude: "Certificat d'aptitude",
  inapatitude: "Certificat d'inaptitude",
  hospitalisation: "Certificat d'hospitalisation",
  custom: "Certificat médical",
};

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: cert, isLoading } = useCertificate(Number(id));

  async function handlePrint() {
    try {
      const resp = await api.get(`/doctor/pdf/certificat/${id}`, {
        responseType: "blob",
      });
      window.open(URL.createObjectURL(resp.data as Blob), "_blank");
    } catch {
      toast.error("Impossible de générer le PDF");
    }
  }

  if (isLoading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  if (!cert)
    return (
      <div className="py-24 text-center text-muted-foreground">
        Certificat introuvable
      </div>
    );

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
            <h1 className="text-xl font-bold">
              {TYPE_LABELS[cert.type] ?? "Certificat médical"}
            </h1>
            <p className="font-mono text-sm text-primary">{cert.numero}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          PDF
        </Button>
      </div>

      <div className="max-w-2xl rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-1 text-sm text-muted-foreground">
          <p>
            Date :{" "}
            <span className="font-medium text-foreground">
              {format(new Date(cert.date_certificat), "dd MMMM yyyy", {
                locale: fr,
              })}
            </span>
          </p>
          {cert.patient && (
            <p>
              Patient :{" "}
              <span className="font-medium text-foreground">
                {cert.patient.nom_complet} ({cert.patient.numero_dossier})
              </span>
            </p>
          )}
          {cert.nombre_jours && (
            <p>
              Durée :{" "}
              <span className="font-medium text-foreground">
                {cert.nombre_jours} jours
              </span>
              {cert.date_debut && (
                <span>
                  {" "}
                  du{" "}
                  {format(new Date(cert.date_debut), "dd/MM/yyyy")}
                  {cert.date_fin &&
                    ` au ${format(new Date(cert.date_fin), "dd/MM/yyyy")}`}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="prose prose-sm max-w-none rounded-md bg-muted/30 p-4">
          <p className="whitespace-pre-wrap">{cert.contenu}</p>
        </div>

        <div className="mt-12 flex justify-end">
          <div className="text-center">
            <div className="mb-2 h-16 w-40 rounded-lg border-2 border-dashed border-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              Cachet et signature du médecin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
