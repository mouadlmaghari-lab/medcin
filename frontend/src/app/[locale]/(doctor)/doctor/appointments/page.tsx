"use client";

import dynamic from "next/dynamic";
import { startTransition, useState } from "react";
import { CalendarDays, List, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import {
  useCalendarAppointments,
  useAppointments,
  useCreateAppointment,
} from "@/hooks/use-appointments";
import type { Appointment, StoreAppointmentPayload } from "@/types/appointment";

// FullCalendar is large — load only on client (no SSR, no bundle bloat)
const CalendarView = dynamic(
  () =>
    import("@/components/appointments/calendar-view").then(
      (m) => m.CalendarView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full animate-pulse rounded-xl bg-muted" />
    ),
  },
);

const ETAT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirme: "Confirmé",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
  absent: "Absent",
};

const ETAT_VARIANT: Record<
  string,
  "pending" | "confirmed" | "completed" | "cancelled" | "noshow"
> = {
  en_attente: "pending",
  confirme: "confirmed",
  en_cours: "confirmed",
  termine: "completed",
  annule: "cancelled",
  absent: "noshow",
};

type ViewMode = "calendar" | "list";

// ── List columns ──────────────────────────────────────────
const columns: Column<Appointment>[] = [
  {
    key: "date",
    header: "Date & Heure",
    cell: (a) => (
      <div>
        <p className="font-medium">
          {format(new Date(`${a.date}T${a.heure}`), "EEE d MMM yyyy", {
            locale: fr,
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {a.heure} · {a.duree} min
        </p>
      </div>
    ),
  },
  {
    key: "patient",
    header: "Patient",
    cell: (a) => (
      <div>
        {a.patient ? (
          <>
            <p className="font-medium">{a.patient.nom_complet}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {a.patient.numero_dossier}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">Walk-in</p>
        )}
      </div>
    ),
  },
  {
    key: "description",
    header: "Motif",
    cell: (a) => (
      <span className="text-sm">
        {a.description ?? <span className="text-muted-foreground">—</span>}
      </span>
    ),
  },
  {
    key: "etat",
    header: "Statut",
    cell: (a) => (
      <StatusBadge
        label={ETAT_LABELS[a.etat] ?? a.etat}
        variant={ETAT_VARIANT[a.etat] ?? "pending"}
      />
    ),
  },
];

// ── Page ──────────────────────────────────────────────────
export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [calendarRange, setCalendarRange] = useState({
    start: format(new Date(), "yyyy-MM-01"),
    end: format(new Date(), "yyyy-MM-28"),
  });

  // Inline form state (calendar view)
  const [formKey, setFormKey] = useState(0);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [prefillHeure, setPrefillHeure] = useState<string | undefined>();

  // Dialog state (list view only)
  const [createOpen, setCreateOpen] = useState(false);

  const {
    data: calendarAppts = [],
    isLoading: calLoading,
    error: calError,
    refetch: calRefetch,
  } = useCalendarAppointments(calendarRange.start, calendarRange.end);

  const { data: listData, isLoading: listLoading } = useAppointments({
    start_date: calendarRange.start,
    end_date: calendarRange.end,
    per_page: 50,
  });

  const createMutation = useCreateAppointment();

  function handleDateSelect(start: string, _end: string) {
    const [date, timeRaw] = start.split("T");
    const heure = timeRaw ? timeRaw.slice(0, 5) : "09:00";
    startTransition(() => {
      setPrefillDate(date);
      setPrefillHeure(heure);
      setFormKey((k) => k + 1);
    });
  }

  function handleCreate(values: StoreAppointmentPayload) {
    createMutation.mutate(values, {
      onSuccess: () => {
        startTransition(() => {
          setPrefillDate(undefined);
          setPrefillHeure(undefined);
          setFormKey((k) => k + 1);
        });
        setCreateOpen(false);
      },
    });
  }

  function handleFormReset() {
    startTransition(() => {
      setPrefillDate(undefined);
      setPrefillHeure(undefined);
      setFormKey((k) => k + 1);
    });
  }

  return (
    // h-14 header + p-6 (24px top + 24px bottom) = 104px = 6.5rem
    <div className="flex h-[calc(100dvh-6.5rem)] flex-col gap-4">
      <PageHeader
        title="Rendez-vous"
        description="Gérez les rendez-vous de votre cabinet"
        actions={
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-lg border bg-muted/40 p-0.5">
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition-all ${
                  viewMode === "calendar"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                Calendrier
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-4 w-4" />
                Liste
              </button>
            </div>

            {/* "Nouveau RDV" button only in list view (calendar view has inline form) */}
            {viewMode === "list" && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nouveau RDV
              </Button>
            )}
          </div>
        }
      />

      {viewMode === "calendar" ? (
        // ── Split layout: calendar (left) + form (right) ──
        <div className="flex min-h-0 flex-1 gap-5">
          {/* Left: calendar — fills height, internal time-grid scrolls */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <CalendarView
              appointments={calendarAppts}
              isLoading={calLoading}
              error={
                calError
                  ? (calError as { response?: { data?: { message?: string } } })
                      ?.response?.data?.message ??
                    "Impossible de charger les rendez-vous"
                  : null
              }
              onRetry={() => calRefetch()}
              onDateSelect={handleDateSelect}
              onDatesChange={(start, end) => setCalendarRange({ start, end })}
              calendarHeight="100%"
            />
          </div>

          {/* Right: always-visible new appointment form */}
          <div className="w-80 shrink-0 overflow-y-auto xl:w-96">
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                    <Plus className="size-3.5 text-primary" />
                  </div>
                  Nouveau rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AppointmentForm
                  key={formKey}
                  defaultDate={prefillDate}
                  defaultHeure={prefillHeure}
                  onSubmit={handleCreate}
                  isPending={createMutation.isPending}
                  submitLabel="Créer le rendez-vous"
                  onCancel={handleFormReset}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // ── Full-width list view ──
        <DataTable
          columns={columns}
          data={listData?.data ?? []}
          keyExtractor={(a) => a.id}
          isLoading={listLoading}
          emptyState="Aucun rendez-vous sur cette période"
        />
      )}

      {/* Create dialog — used only from list view */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
            submitLabel="Créer le rendez-vous"
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
