"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Plus, List, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, type Column } from "@/components/ui/data-table";
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
  { ssr: false, loading: () => <div className="h-[600px] animate-pulse rounded-lg bg-muted" /> },
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
export default function AssistantAppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [calendarRange, setCalendarRange] = useState({
    start: format(new Date(), "yyyy-MM-01"),
    end: format(new Date(), "yyyy-MM-28"),
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [prefillHeure, setPrefillHeure] = useState<string | undefined>();

  const { data: calendarAppts = [], isLoading: calLoading } =
    useCalendarAppointments(calendarRange.start, calendarRange.end);

  const { data: listData, isLoading: listLoading } = useAppointments({
    start_date: calendarRange.start,
    end_date: calendarRange.end,
    per_page: 50,
  });

  const createMutation = useCreateAppointment();

  function handleDateSelect(start: string, _end: string) {
    const [date, timeRaw] = start.split("T");
    const heure = timeRaw ? timeRaw.slice(0, 5) : "09:00";
    setPrefillDate(date);
    setPrefillHeure(heure);
    setCreateOpen(true);
  }

  function handleCreate(values: StoreAppointmentPayload) {
    createMutation.mutate(values, {
      onSuccess: () => setCreateOpen(false),
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rendez-vous"
        actions={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-md border bg-muted/40">
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex h-8 items-center gap-1.5 rounded-l-md px-3 text-xs font-medium transition-colors ${
                  viewMode === "calendar"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Calendrier
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-8 items-center gap-1.5 rounded-r-md px-3 text-xs font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Liste
              </button>
            </div>

            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nouveau RDV
            </Button>
          </div>
        }
      />

      {viewMode === "calendar" ? (
        <CalendarView
          appointments={calendarAppts}
          isLoading={calLoading}
          onDateSelect={handleDateSelect}
          onDatesChange={(start, end) =>
            setCalendarRange({ start, end })
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={listData?.data ?? []}
          keyExtractor={(a) => a.id}
          isLoading={listLoading}
          emptyState="Aucun rendez-vous sur cette période"
        />
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            defaultDate={prefillDate}
            defaultHeure={prefillHeure}
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
