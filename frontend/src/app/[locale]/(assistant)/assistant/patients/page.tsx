"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { usePatients } from "@/hooks/use-patients";
import { useDebounce } from "@/hooks/use-debounce";
import type { Patient } from "@/types/patient";

// ── Columns ───────────────────────────────────────────────
const columns: Column<Patient>[] = [
  {
    key: "numero_dossier",
    header: "N° Dossier",
    cell: (p) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {p.numero_dossier}
      </span>
    ),
    headerClassName: "w-[130px]",
  },
  {
    key: "nom_complet",
    header: "Patient",
    cell: (p) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {p.nom_complet?.charAt(0) ?? "?"}
        </div>
        <div>
          <p className="font-medium">{p.nom_complet}</p>
          {p.cin && (
            <p className="text-xs text-muted-foreground">{p.cin}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "telephone",
    header: "Téléphone",
    cell: (p) => (
      <a
        href={`tel:${p.telephone}`}
        className="text-sm hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {p.telephone}
      </a>
    ),
  },
  {
    key: "date_naissance",
    header: "Âge / Naissance",
    cell: (p) =>
      p.date_naissance ? (
        <span className="text-sm">
          {p.age && <span className="font-medium">{p.age} ans</span>}
          {p.age && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({format(new Date(p.date_naissance), "dd/MM/yyyy")})
            </span>
          )}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "genre",
    header: "Genre",
    cell: (p) =>
      p.genre ? (
        <Badge variant="outline" className="text-xs">
          {p.genre}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    headerClassName: "w-[90px]",
  },
  {
    key: "ville",
    header: "Ville",
    cell: (p) => p.ville ?? <span className="text-muted-foreground">—</span>,
  },
  {
    key: "derniere_consultation",
    header: "Dernière consultation",
    cell: (p) =>
      p.derniere_consultation ? (
        <span className="text-sm">
          {format(new Date(p.derniere_consultation), "dd MMM yyyy", {
            locale: fr,
          })}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Aucune</span>
      ),
  },
];

// ── Page ─────────────────────────────────────────────────
export default function AssistantPatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = usePatients({
    q: debouncedSearch || undefined,
    page,
    per_page: 20,
  });

  const patients = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Patients"
        description={
          meta ? `${meta.total} patient${meta.total !== 1 ? "s" : ""} enregistré${meta.total !== 1 ? "s" : ""}` : undefined
        }
        actions={
          <Button
            size="sm"
            onClick={() => router.push("/assistant/patients/new")}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nouveau patient
          </Button>
        }
      />

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom, téléphone, CIN..."
            className="ps-9"
          />
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
          Filtres
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={patients}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        onRowClick={(p) => router.push(`/assistant/patients/${p.id}`)}
        emptyState={
          <EmptyState
            icon={UserRound}
            title="Aucun patient"
            description={
              search
                ? `Aucun résultat pour "${search}"`
                : "Commencez par enregistrer votre premier patient"
            }
            action={
              !search && (
                <Button
                  size="sm"
                  onClick={() => router.push("/assistant/patients/new")}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nouveau patient
                </Button>
              )
            }
          />
        }
      />

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {meta.from}–{meta.to} sur {meta.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <span className="text-xs">
              Page {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === meta.last_page}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
