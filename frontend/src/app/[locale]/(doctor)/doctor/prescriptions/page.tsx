"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, FileText } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { usePrescriptions } from "@/hooks/use-prescriptions";
import { NewPrescriptionModal } from "@/components/prescriptions/new-prescription-modal";
import type { Prescription } from "@/types/prescription";

const columns: Column<Prescription>[] = [
  {
    key: "date",
    header: "Date",
    cell: (p) => (
      <span className="font-medium">
        {format(new Date(p.date_ordonnance), "dd MMM yyyy", { locale: fr })}
      </span>
    ),
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
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "items",
    header: "Médicaments",
    cell: (p) => (
      <div className="flex flex-wrap gap-1">
        {p.items.slice(0, 3).map((item, i) => (
          <span
            key={i}
            className="rounded-full border bg-muted px-2 py-0.5 text-xs"
          >
            {item.medication_name.split(" ")[0]}
          </span>
        ))}
        {p.items.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{p.items.length - 3}
          </span>
        )}
      </div>
    ),
  },
];

export default function PrescriptionsPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = usePrescriptions({ page: 1 });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ordonnances"
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nouvelle ordonnance
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        onRowClick={(p) => router.push(`/doctor/prescriptions/${p.id}`)}
        emptyState={
          <div className="flex flex-col items-center py-12">
            <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aucune ordonnance</p>
          </div>
        }
      />
      <NewPrescriptionModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
