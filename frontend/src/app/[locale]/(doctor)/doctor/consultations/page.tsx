"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Stethoscope } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { NewConsultationButton } from "@/components/consultations/new-consultation-button";
import { useConsultations } from "@/hooks/use-consultations";
import type { Consultation } from "@/types/consultation";

const columns: Column<Consultation>[] = [
  {
    key: "date",
    header: "Date",
    cell: (c) => (
      <span className="font-medium">
        {format(new Date(c.date_consultation), "EEE d MMM yyyy", { locale: fr })}
      </span>
    ),
  },
  {
    key: "patient",
    header: "Patient",
    cell: (c) =>
      c.patient ? (
        <div>
          <p className="font-medium">{c.patient.nom_complet}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {c.patient.numero_dossier}
          </p>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "motif",
    header: "Motif",
    cell: (c) => <span className="text-sm">{c.motif}</span>,
  },
  {
    key: "diagnostic",
    header: "Diagnostic",
    cell: (c) =>
      c.diagnostic ? (
        <span className="max-w-[200px] truncate text-sm block">{c.diagnostic}</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
  },
  {
    key: "vitals",
    header: "Constantes",
    cell: (c) => (
      <div className="flex flex-wrap gap-1 text-xs">
        {c.tension_systolique && c.tension_diastolique && (
          <span className="rounded bg-muted px-1.5 py-0.5">
            {c.tension_systolique}/{c.tension_diastolique}
          </span>
        )}
        {c.poids && (
          <span className="rounded bg-muted px-1.5 py-0.5">{c.poids}kg</span>
        )}
        {c.glycemie && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">
            G {c.glycemie}
          </span>
        )}
        {c.hba1c && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">
            HbA1c {c.hba1c}%
          </span>
        )}
      </div>
    ),
  },
];

export default function ConsultationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useConsultations({ page, per_page: 25 });
  const consultations = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Consultations"
        description={meta ? `${meta.total} consultation${meta.total !== 1 ? "s" : ""}` : undefined}
        actions={<NewConsultationButton />}
      />

      <DataTable
        columns={columns}
        data={consultations}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        onRowClick={(c) => router.push(`/doctor/consultations/${c.id}`)}
        emptyState={
          <EmptyState
            icon={Stethoscope}
            title="Aucune consultation"
            description="Les consultations apparaîtront ici"
          />
        }
      />

      {meta && meta.last_page > 1 && (
        <div className="flex justify-end gap-2 text-sm">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="rounded-md border px-3 py-1 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="px-2 py-1 text-muted-foreground">
            {meta.current_page} / {meta.last_page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === meta.last_page}
            className="rounded-md border px-3 py-1 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
