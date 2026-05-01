"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useInvoice } from "@/hooks/use-invoices";
import api from "@/lib/api";
import { toast } from "sonner";
import type { Invoice } from "@/types/invoice";

const STATUT_LABELS: Record<Invoice["statut"], string> = {
  brouillon: "Brouillon",
  emise: "Émise",
  payee: "Payée",
  annulee: "Annulée",
};

const STATUT_VARIANTS: Record<
  Invoice["statut"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  brouillon: "secondary",
  emise: "default",
  payee: "outline",
  annulee: "destructive",
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(Number(id));

  async function handlePrintPDF() {
    try {
      const resp = await api.get(`/doctor/pdf/facture/${id}`, {
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

  if (!invoice) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Facture introuvable
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight font-mono">
                {invoice.numero}
              </h1>
              <Badge variant={STATUT_VARIANTS[invoice.statut]}>
                {STATUT_LABELS[invoice.statut]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(invoice.date_facture), "dd MMMM yyyy", {
                locale: fr,
              })}
              {invoice.patient && ` · ${invoice.patient.nom_complet}`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrintPDF}>
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          Imprimer PDF
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        {/* Patient info */}
        {invoice.patient && (
          <div className="border-b p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{invoice.patient.nom_complet}</p>
                <p className="font-mono text-sm text-primary">
                  {invoice.patient.numero_dossier}
                </p>
                {invoice.patient.adresse && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.patient.adresse}
                    {invoice.patient.ville && `, ${invoice.patient.ville}`}
                  </p>
                )}
                {invoice.patient.cin && (
                  <p className="text-sm text-muted-foreground">
                    CIN: {invoice.patient.cin}
                  </p>
                )}
              </div>
              {invoice.echeance && (
                <div className="text-end">
                  <p className="text-xs text-muted-foreground">Échéance</p>
                  <p className="text-sm font-medium">
                    {format(new Date(invoice.echeance), "dd/MM/yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Line items */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </th>
                <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Qté
                </th>
                <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  P.U HT
                </th>
                <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  TVA %
                </th>
                <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Montant HT
                </th>
                <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Montant TTC
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lignes.map((ligne, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-5 py-3 font-medium">
                    {ligne.description}
                  </td>
                  <td className="px-5 py-3 text-end tabular-nums text-muted-foreground">
                    {ligne.quantite}
                  </td>
                  <td className="px-5 py-3 text-end tabular-nums text-muted-foreground">
                    {ligne.prix_unitaire_ht.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-end tabular-nums text-muted-foreground">
                    {ligne.tva}%
                  </td>
                  <td className="px-5 py-3 text-end tabular-nums">
                    {ligne.montant_ht.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-end tabular-nums font-semibold">
                    {ligne.montant_ttc.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t bg-muted/20 p-5">
          <div className="ms-auto max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total HT</span>
              <span className="tabular-nums font-medium">
                {invoice.total_ht.toFixed(2)} MAD
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total TVA</span>
              <span className="tabular-nums font-medium">
                {invoice.total_tva.toFixed(2)} MAD
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total TTC</span>
              <span className="tabular-nums text-primary">
                {invoice.total_ttc.toFixed(2)} MAD
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t p-5">
            <p className="text-sm font-medium">Notes</p>
            <p className="mt-1 text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
