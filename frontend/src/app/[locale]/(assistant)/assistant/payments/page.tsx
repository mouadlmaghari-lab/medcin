"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Printer, CreditCard } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePayments } from "@/hooks/use-payments";
import api from "@/lib/api";
import { toast } from "sonner";
import type { Payment } from "@/types/payment";

const MODE_LABELS: Record<string, string> = {
  especes: "Espèces",
  carte: "Carte bancaire",
  cheque: "Chèque",
  virement: "Virement",
  assurance: "Assurance",
};

const columns: Column<Payment>[] = [
  {
    key: "date",
    header: "Date",
    cell: (p) => format(new Date(p.date_paiement), "dd MMM yyyy", { locale: fr }),
  },
  {
    key: "patient",
    header: "Patient",
    cell: (p) =>
      p.patient ? (
        <div>
          <p className="font-medium">{p.patient.nom_complet}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {p.patient.numero_dossier}
          </p>
        </div>
      ) : null,
  },
  {
    key: "montant_du",
    header: "Montant dû",
    cell: (p) => (
      <span className="font-medium">
        {p.montant_du.toLocaleString("fr-MA")} MAD
      </span>
    ),
  },
  {
    key: "montant_paye",
    header: "Payé",
    cell: (p) => (
      <span className="font-semibold text-emerald-600">
        {p.montant_paye.toLocaleString("fr-MA")} MAD
      </span>
    ),
  },
  {
    key: "solde",
    header: "Solde",
    cell: (p) =>
      p.solde > 0 ? (
        <span className="font-medium text-amber-600">
          {p.solde.toLocaleString("fr-MA")} MAD
        </span>
      ) : (
        <StatusBadge label="Soldé" variant="confirmed" />
      ),
  },
  {
    key: "mode",
    header: "Mode",
    cell: (p) => (
      <span className="text-sm">{MODE_LABELS[p.mode_paiement] ?? p.mode_paiement}</span>
    ),
  },
  {
    key: "recu",
    header: "",
    cell: (p) => (
      <button
        onClick={async (e) => {
          e.stopPropagation();
          try {
            const resp = await api.get(`/doctor/pdf/recu/${p.id}`, {
              responseType: "blob",
            });
            window.open(URL.createObjectURL(resp.data as Blob), "_blank");
          } catch {
            toast.error("Impossible de générer le reçu");
          }
        }}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Printer className="h-3.5 w-3.5" />
        Reçu
      </button>
    ),
  },
];

export default function AssistantPaymentsPage() {
  const router = useRouter();
  const { data, isLoading } = usePayments({ per_page: 30 });
  const payments = data?.data ?? [];

  const totalDu = payments.reduce((s, p) => s + p.montant_du, 0);
  const totalPaye = payments.reduce((s, p) => s + p.montant_paye, 0);
  const totalSolde = payments.reduce((s, p) => s + p.solde, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Règlements"
        actions={
          <Button
            size="sm"
            onClick={() => router.push("/assistant/payments/new")}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nouveau règlement
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total encaissé"
          value={`${totalPaye.toLocaleString("fr-MA")} MAD`}
          icon={CreditCard}
        />
        <StatCard
          label="Total dû"
          value={`${totalDu.toLocaleString("fr-MA")} MAD`}
        />
        <StatCard
          label="Solde restant"
          value={`${totalSolde.toLocaleString("fr-MA")} MAD`}
        />
      </div>

      <DataTable
        columns={columns}
        data={payments}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyState="Aucun règlement enregistré"
      />
    </div>
  );
}
