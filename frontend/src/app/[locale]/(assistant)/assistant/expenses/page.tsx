"use client";

import { useState } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  Receipt,
  TrendingDown,
  Tag,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { useExpenses } from "@/hooks/use-invoices";
import type { Expense, ExpenseCategory } from "@/types/invoice";

// ── Category metadata ────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  loyer: "Loyer",
  charges: "Charges",
  materiel: "Matériel",
  consommables: "Consommables",
  formation: "Formation",
  logiciel: "Logiciel",
  assurance: "Assurance",
  personnel: "Personnel",
  autre: "Autre",
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  loyer: "bg-blue-100 text-blue-700",
  charges: "bg-orange-100 text-orange-700",
  materiel: "bg-violet-100 text-violet-700",
  consommables: "bg-cyan-100 text-cyan-700",
  formation: "bg-emerald-100 text-emerald-700",
  logiciel: "bg-indigo-100 text-indigo-700",
  assurance: "bg-yellow-100 text-yellow-700",
  personnel: "bg-pink-100 text-pink-700",
  autre: "bg-gray-100 text-gray-700",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function AssistantExpensesPage() {
  const [page, setPage] = useState(1);
  const [categorie, setCategorie] = useState<string>("all");

  // Current month defaults
  const now = new Date();
  const [startDate] = useState(format(startOfMonth(now), "yyyy-MM-dd"));
  const [endDate] = useState(format(endOfMonth(now), "yyyy-MM-dd"));

  const { data, isLoading } = useExpenses({
    page,
    categorie: categorie !== "all" ? categorie : undefined,
    start_date: startDate,
    end_date: endDate,
  });

  const expenses = data?.data ?? [];
  const meta = data?.meta as { last_page?: number; total?: number } | undefined;

  // Client-side monthly total (from current page)
  const monthTotal = expenses.reduce((sum, e) => sum + e.montant, 0);

  // Category breakdown
  const byCategory = expenses.reduce(
    (acc, e) => {
      acc[e.categorie] = (acc[e.categorie] ?? 0) + e.montant;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dépenses"
        description={`Mois en cours · ${format(now, "MMMM yyyy", { locale: fr })}`}
        actions={
          <Button asChild size="sm">
            <Link href="/assistant/expenses/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nouvelle dépense
            </Link>
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total dépenses (mois)"
          value={`${monthTotal.toLocaleString("fr-MA")} MAD`}
          icon={TrendingDown}
        />
        <StatCard
          label="Nombre de dépenses"
          value={meta?.total ?? expenses.length}
          icon={Receipt}
        />
        <StatCard
          label="Catégorie principale"
          value={
            topCategory
              ? CATEGORY_LABELS[topCategory[0] as ExpenseCategory]
              : "—"
          }
          icon={Tag}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={categorie}
          onValueChange={(v) => {
            setCategorie(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable<Expense>
        data={expenses}
        isLoading={isLoading}
        keyExtractor={(e) => e.id}
        columns={[
          {
            key: "date_depense",
            header: "Date",
            cell: (e) => (
              <span className="text-sm text-muted-foreground">
                {format(new Date(e.date_depense), "dd MMM yyyy", {
                  locale: fr,
                })}
              </span>
            ),
          },
          {
            key: "categorie",
            header: "Catégorie",
            cell: (e) => (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[e.categorie]}`}
              >
                {CATEGORY_LABELS[e.categorie]}
              </span>
            ),
          },
          {
            key: "description",
            header: "Description",
            cell: (e) => (
              <span className="text-sm font-medium">{e.description}</span>
            ),
          },
          {
            key: "fournisseur",
            header: "Fournisseur",
            cell: (e) => (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {e.fournisseur ? (
                  <>
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {e.fournisseur}
                  </>
                ) : (
                  "—"
                )}
              </div>
            ),
          },
          {
            key: "reference",
            header: "Référence",
            cell: (e) => (
              <span className="font-mono text-xs text-muted-foreground">
                {e.reference ?? "—"}
              </span>
            ),
          },
          {
            key: "montant",
            header: "Montant (MAD)",
            headerClassName: "text-end",
            className: "text-end",
            cell: (e) => (
              <span className="tabular-nums font-semibold">
                {e.montant.toLocaleString("fr-MA")}
              </span>
            ),
          },
          {
            key: "recu",
            header: "",
            className: "w-10",
            cell: (e) =>
              e.recu_url ? (
                <a
                  href={e.recu_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(ev) => ev.stopPropagation()}
                  className="text-xs text-primary hover:underline"
                  title="Voir le reçu"
                >
                  Reçu
                </a>
              ) : null,
          },
        ]}
        emptyState={
          <div className="py-16 text-center">
            <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aucune dépense</p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/assistant/expenses/new">Ajouter une dépense</Link>
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
