"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Users,
  CalendarDays,
  Stethoscope,
  TrendingUp,
  Download,
  RefreshCw,
  FileText,
  Clock,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";
import {
  useDashboardStats,
  useAppointmentTrends,
  useRevenueTrends,
  useTopProcedures,
} from "@/hooks/use-statistics";
import api from "@/lib/api";
import { toast } from "sonner";

// ── Recharts — heavy lib, load client-only ────────────────────────────────────
const RechartsArea = dynamic(
  () => import("@/components/charts/area-chart").then((m) => m.AreaChartWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] animate-pulse rounded-lg bg-muted" />
    ),
  },
);
const RechartsBar = dynamic(
  () => import("@/components/charts/bar-chart").then((m) => m.BarChartWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] animate-pulse rounded-lg bg-muted" />
    ),
  },
);
const RechartsPie = dynamic(
  () => import("@/components/charts/pie-chart").then((m) => m.PieChartWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] animate-pulse rounded-lg bg-muted" />
    ),
  },
);

// ── Date presets ──────────────────────────────────────────────────────────────
const PRESETS = [
  {
    label: "7 jours",
    from: () => format(subDays(new Date(), 6), "yyyy-MM-dd"),
    to: () => format(new Date(), "yyyy-MM-dd"),
  },
  {
    label: "30 jours",
    from: () => format(subDays(new Date(), 29), "yyyy-MM-dd"),
    to: () => format(new Date(), "yyyy-MM-dd"),
  },
  {
    label: "Ce mois",
    from: () => format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to: () => format(endOfMonth(new Date()), "yyyy-MM-dd"),
  },
  {
    label: "90 jours",
    from: () => format(subDays(new Date(), 89), "yyyy-MM-dd"),
    to: () => format(new Date(), "yyyy-MM-dd"),
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [from, setFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activePreset, setActivePreset] = useState<string>("Ce mois");

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setFrom(preset.from());
    setTo(preset.to());
    setActivePreset(preset.label);
  }

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } =
    useDashboardStats(from, to);
  const { data: apptTrends = [], isLoading: apptLoading } =
    useAppointmentTrends(from, to);
  const { data: revTrends = [], isLoading: revLoading } =
    useRevenueTrends(from, to);
  const { data: procedures = [] } = useTopProcedures(8);

  // ── Derived chart data ────────────────────────────────────────────────────
  const revenueChartData = useMemo(
    () =>
      revTrends.map((d) => ({
        date: format(new Date(d.date), "d MMM", { locale: fr }),
        Recettes: d.amount,
      })),
    [revTrends],
  );

  const apptChartData = useMemo(
    () =>
      apptTrends.map((d) => ({
        date: format(new Date(d.date), "d MMM", { locale: fr }),
        Total: d.total,
        Réalisés: d.by_status["realise"] ?? 0,
        Annulés: d.by_status["annule"] ?? 0,
      })),
    [apptTrends],
  );

  const appointmentPieData = stats
    ? [
        { name: "Réalisés", value: stats.appointments.completed, fill: "#10b981" },
        { name: "En attente", value: stats.appointments.pending, fill: "#f59e0b" },
        { name: "Annulés", value: stats.appointments.cancelled, fill: "#ef4444" },
        { name: "Absents", value: stats.appointments.no_show, fill: "#94a3b8" },
      ].filter((d) => d.value > 0)
    : [];

  const procedurePieData = procedures.slice(0, 6).map((p, i) => ({
    name: p.name || "—",
    value: p.count,
    fill: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"][i],
  }));

  // ── Export ────────────────────────────────────────────────────────────────
  async function handleExportPDF() {
    try {
      const resp = await api.get("/doctor/pdf/download", {
        params: { type: "statistics", from, to },
        responseType: "blob",
      });
      const url = URL.createObjectURL(resp.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-statistiques-${from}-${to}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export PDF non disponible pour le moment");
    }
  }

  const isLoading = statsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques & Rapports"
        description={`Période du ${format(new Date(from), "d MMM yyyy", { locale: fr })} au ${format(new Date(to), "d MMM yyyy", { locale: fr })}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchStats(); }}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* ── Date range selector ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
        {/* Quick presets */}
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activePreset === p.label
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Du</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setActivePreset("");
              }}
              className="h-8 w-[140px] text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Au</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setActivePreset("");
              }}
              className="h-8 w-[140px] text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total patients"
          value={isLoading ? "—" : (stats?.patients.total ?? 0)}
          icon={Users}
        />
        <StatCard
          label="Rendez-vous (période)"
          value={isLoading ? "—" : (stats?.appointments.total ?? 0)}
          icon={CalendarDays}
        />
        <StatCard
          label="Consultations"
          value={isLoading ? "—" : (stats?.consultations.total ?? 0)}
          icon={Stethoscope}
        />
        <StatCard
          label="Recettes (MAD)"
          value={
            isLoading
              ? "—"
              : `${(stats?.revenue.total_payments ?? 0).toLocaleString("fr-MA")}`
          }
          icon={TrendingUp}
        />
      </div>

      {/* ── Second row of KPIs ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Taux de réalisation</p>
          <p className="mt-1 text-2xl font-bold">
            {stats && stats.appointments.total > 0
              ? `${Math.round((stats.appointments.completed / stats.appointments.total) * 100)}%`
              : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">des rendez-vous</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Durée moy. consultation</p>
          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-2xl font-bold">
              {stats?.consultations.average_time ?? "—"}
            </p>
            {stats && <p className="text-sm text-muted-foreground">min</p>}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Durée moyenne
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Ordonnances émises</p>
          <p className="mt-1 text-2xl font-bold">
            {stats?.prescriptions.total ?? "—"}
          </p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            Sur la période
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Certificats délivrés</p>
          <p className="mt-1 text-2xl font-bold">
            {stats?.certificates.total ?? "—"}
          </p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            Sur la période
          </div>
        </div>
      </div>

      {/* ── Charts row 1 — Revenue + Appointments trends ────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Recettes par jour (MAD)</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Évolution des encaissements sur la période
          </p>
          {revLoading ? (
            <div className="h-[240px] animate-pulse rounded-lg bg-muted" />
          ) : revenueChartData.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              Aucune donnée sur cette période
            </div>
          ) : (
            <RechartsArea data={revenueChartData} dataKey="Recettes" color="#10b981" />
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Rendez-vous par jour</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Total · Réalisés · Annulés
          </p>
          {apptLoading ? (
            <div className="h-[240px] animate-pulse rounded-lg bg-muted" />
          ) : apptChartData.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              Aucune donnée sur cette période
            </div>
          ) : (
            <RechartsBar
              data={apptChartData}
              bars={[
                { dataKey: "Total", color: "#3b82f6" },
                { dataKey: "Réalisés", color: "#10b981" },
                { dataKey: "Annulés", color: "#ef4444" },
              ]}
            />
          )}
        </div>
      </div>

      {/* ── Charts row 2 — Appointment status pie + Top procedures ──────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Statut des rendez-vous</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Répartition sur la période sélectionnée
          </p>
          {appointmentPieData.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              Aucun rendez-vous sur cette période
            </div>
          ) : (
            <RechartsPie data={appointmentPieData} />
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Types de consultations</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Répartition par type (tous temps)
          </p>
          {procedurePieData.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              Aucune consultation enregistrée
            </div>
          ) : (
            <RechartsPie data={procedurePieData} />
          )}
        </div>
      </div>

      {/* ── Revenue summary ──────────────────────────────────────────────────── */}
      {stats && (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Synthèse financière</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total encaissé</p>
              <p className="text-xl font-bold text-emerald-600">
                {stats.revenue.total_payments.toLocaleString("fr-MA")} MAD
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.revenue.payment_count} paiement{stats.revenue.payment_count !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total facturé</p>
              <p className="text-xl font-bold">
                {stats.revenue.total_invoiced.toLocaleString("fr-MA")} MAD
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.revenue.invoice_count} facture{stats.revenue.invoice_count !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">En attente de paiement</p>
              <p className="text-xl font-bold text-amber-600">
                {stats.revenue.pending_payments.toLocaleString("fr-MA")} MAD
              </p>
              <p className="text-xs text-muted-foreground">À encaisser</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
