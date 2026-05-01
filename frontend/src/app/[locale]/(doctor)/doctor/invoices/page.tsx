"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { useInvoices } from "@/hooks/use-invoices";
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

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInvoices({ page });

  async function handlePrintPDF(e: React.MouseEvent, id: number) {
    e.stopPropagation();
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

  const meta = data?.meta as { last_page?: number } | undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Factures"
        description="Gestion de la facturation"
        actions={
          <Button asChild size="sm">
            <Link href="/doctor/invoices/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nouvelle facture
            </Link>
          </Button>
        }
      />

      <DataTable<Invoice>
        data={data?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(inv) => inv.id}
        columns={[
          {
            key: "numero",
            header: "Numéro",
            cell: (inv) => (
              <Link
                href={`/doctor/invoices/${inv.id}`}
                className="font-mono text-sm font-semibold text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {inv.numero}
              </Link>
            ),
          },
          {
            key: "patient",
            header: "Patient",
            cell: (inv) => (
              <span className="text-sm">
                {inv.patient?.nom_complet ?? "—"}
              </span>
            ),
          },
          {
            key: "date_facture",
            header: "Date",
            cell: (inv) => (
              <span className="text-sm text-muted-foreground">
                {format(new Date(inv.date_facture), "dd MMM yyyy", {
                  locale: fr,
                })}
              </span>
            ),
          },
          {
            key: "total_ht",
            header: "HT",
            headerClassName: "text-end",
            className: "text-end",
            cell: (inv) => (
              <span className="tabular-nums text-sm text-muted-foreground">
                {inv.total_ht.toLocaleString("fr-MA")}
              </span>
            ),
          },
          {
            key: "total_tva",
            header: "TVA",
            headerClassName: "text-end",
            className: "text-end",
            cell: (inv) => (
              <span className="tabular-nums text-sm text-muted-foreground">
                {inv.total_tva.toLocaleString("fr-MA")}
              </span>
            ),
          },
          {
            key: "total_ttc",
            header: "TTC (MAD)",
            headerClassName: "text-end",
            className: "text-end",
            cell: (inv) => (
              <span className="tabular-nums font-semibold">
                {inv.total_ttc.toLocaleString("fr-MA")}
              </span>
            ),
          },
          {
            key: "statut",
            header: "Statut",
            cell: (inv) => (
              <Badge variant={STATUT_VARIANTS[inv.statut]}>
                {STATUT_LABELS[inv.statut]}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-10",
            cell: (inv) => (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => handlePrintPDF(e, inv.id)}
                title="Imprimer PDF"
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
            ),
          },
        ]}
        emptyState={
          <div className="py-16 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aucune facture</p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/doctor/invoices/new">Créer une facture</Link>
            </Button>
          </div>
        }
      />

      {meta && (meta.last_page ?? 1) > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === (meta.last_page ?? 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
