"use client";

import { useState } from "react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  Search,
  Pill,
  AlertTriangle,
  PackageOpen,
  CalendarX,
  Pencil,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useMedications,
  useAdjustStock,
  useDeactivateMedication,
} from "@/hooks/use-medications";
import { MEDICATION_CATEGORIES } from "@/types/medication";
import type { Medication } from "@/types/medication";

// ── Stock badge ────────────────────────────────────────────────────────────────
function StockBadge({ med }: { med: Medication }) {
  if (med.is_low_stock && med.stock_qty === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        <AlertTriangle className="h-3 w-3" />
        Épuisé
      </span>
    );
  }
  if (med.is_low_stock) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
        <AlertTriangle className="h-3 w-3" />
        Stock bas · {med.stock_qty}
      </span>
    );
  }
  return (
    <span className="tabular-nums text-sm font-medium">{med.stock_qty}</span>
  );
}

// ── Expiry badge ───────────────────────────────────────────────────────────────
function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground text-xs">—</span>;

  const days = differenceInDays(new Date(date), new Date());
  const formatted = format(new Date(date), "dd MMM yyyy", { locale: fr });

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        <CalendarX className="h-3 w-3" />
        Expiré
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
        ⚠ {formatted}
      </span>
    );
  }
  return <span className="text-sm text-muted-foreground">{formatted}</span>;
}

// ── Inline stock adjuster ──────────────────────────────────────────────────────
function StockAdjuster({ med }: { med: Medication }) {
  const adjust = useAdjustStock(med.id);
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          adjust.mutate(Math.max(0, med.stock_qty - 1));
        }}
        disabled={adjust.isPending || med.stock_qty <= 0}
        className="flex h-6 w-6 items-center justify-center rounded border text-muted-foreground hover:bg-muted disabled:opacity-30"
      >
        <ChevronDown className="h-3 w-3" />
      </button>
      <StockBadge med={med} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          adjust.mutate(med.stock_qty + 1);
        }}
        disabled={adjust.isPending}
        className="flex h-6 w-6 items-center justify-center rounded border text-muted-foreground hover:bg-muted disabled:opacity-30"
      >
        <ChevronUp className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── Table columns ─────────────────────────────────────────────────────────────
function buildColumns(onEdit: (id: number) => void): Column<Medication>[] {
  return [
    {
      key: "nom",
      header: "Médicament",
      cell: (m) => (
        <div>
          <p className="font-medium leading-tight">{m.nom}</p>
          {m.nom_generique && (
            <p className="text-xs text-muted-foreground italic">
              {m.nom_generique}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "categorie",
      header: "Catégorie",
      cell: (m) =>
        m.categorie ? (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {MEDICATION_CATEGORIES.find((c) => c.value === m.categorie)?.label ?? m.categorie}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "forme",
      header: "Forme / Unité",
      cell: (m) => (
        <span className="text-sm capitalize text-muted-foreground">
          {[m.forme, m.unite].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (m) => <StockAdjuster med={m} />,
    },
    {
      key: "prix_vente",
      header: "Prix vente (MAD)",
      headerClassName: "text-end",
      className: "text-end",
      cell: (m) =>
        m.prix_vente != null ? (
          <span className="tabular-nums font-medium">
            {Number(m.prix_vente).toLocaleString("fr-MA")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "date_expiration",
      header: "Expiration",
      cell: (m) => <ExpiryBadge date={m.date_expiration} />,
    },
    {
      key: "active",
      header: "Statut",
      cell: (m) => (
        <Badge variant={m.active ? "default" : "secondary"}>
          {m.active ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      cell: (m) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(m.id);
          }}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Modifier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MedicationsPage() {
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState<string>("all");
  const [showAlerts, setShowAlerts] = useState<"all" | "low_stock" | "expiring">("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch || undefined,
    categorie: categorie !== "all" ? categorie : undefined,
    low_stock: showAlerts === "low_stock" ? true : undefined,
    expiring_soon: showAlerts === "expiring" ? true : undefined,
    per_page: 25,
    page,
  };

  const { data, isLoading } = useMedications(filters);

  // Counts for KPI cards — fetch without filters
  const { data: allData } = useMedications({ per_page: 200, active: true });
  const allMeds = allData?.data ?? [];
  const lowStockCount = allMeds.filter((m) => m.is_low_stock).length;
  const expiringCount = allMeds.filter((m) => {
    if (!m.date_expiration) return false;
    return differenceInDays(new Date(m.date_expiration), new Date()) <= 30;
  }).length;

  const medications = data?.data ?? [];
  const meta = data?.meta;

  function handleEdit(id: number) {
    window.location.href = `/doctor/medications/${id}/edit`;
  }

  const columns = buildColumns(handleEdit);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Médicaments & Stock"
        description="Catalogue du cabinet · gestion des stocks et alertes"
        actions={
          <Button asChild size="sm">
            <Link href="/doctor/medications/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Nouveau médicament
            </Link>
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total dans le catalogue"
          value={allData?.meta.total ?? "—"}
          icon={Pill}
        />
        <StatCard
          label="Stock bas / épuisé"
          value={lowStockCount}
          icon={PackageOpen}
        />
        <StatCard
          label="Expirent dans 30 jours"
          value={expiringCount}
          icon={CalendarX}
        />
      </div>

      {/* Alert banner — low stock or expiring */}
      {(lowStockCount > 0 || expiringCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {lowStockCount > 0 && (
            <button
              onClick={() => setShowAlerts(showAlerts === "low_stock" ? "all" : "low_stock")}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                showAlerts === "low_stock"
                  ? "border-amber-400 bg-amber-100 text-amber-800"
                  : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {lowStockCount} en stock bas
              {showAlerts === "low_stock" && " · Affichés"}
            </button>
          )}
          {expiringCount > 0 && (
            <button
              onClick={() => setShowAlerts(showAlerts === "expiring" ? "all" : "expiring")}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                showAlerts === "expiring"
                  ? "border-orange-400 bg-orange-100 text-orange-800"
                  : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              <CalendarX className="h-3.5 w-3.5" />
              {expiringCount} expirent bientôt
              {showAlerts === "expiring" && " · Affichés"}
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Nom, générique, code-barres..."
            className="ps-9"
          />
        </div>

        <Select
          value={categorie}
          onValueChange={(v) => {
            setCategorie(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {MEDICATION_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showAlerts !== "all" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlerts("all")}
          >
            Effacer le filtre
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={medications}
        keyExtractor={(m) => m.id}
        isLoading={isLoading}
        emptyState={
          <div className="py-16 text-center">
            <Pill className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aucun médicament trouvé</p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/doctor/medications/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Ajouter au catalogue
              </Link>
            </Button>
          </div>
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
