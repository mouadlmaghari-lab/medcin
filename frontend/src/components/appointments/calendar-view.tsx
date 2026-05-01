"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import type { EventClickArg, DateSelectArg } from "@fullcalendar/core";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/types/appointment";

const ETAT_COLORS: Record<string, string> = {
  en_attente: "#f59e0b",
  confirme: "#10b981",
  en_cours: "#6366f1",
  termine: "#3b82f6",
  annule: "#ef4444",
  absent: "#6b7280",
};

/** Detect mobile viewport for responsive calendar initial view */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

interface CalendarViewProps {
  appointments: Appointment[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onDateSelect?: (start: string, end: string) => void;
  onEventClick?: (appointment: Appointment) => void;
  onDatesChange?: (start: string, end: string) => void;
  /** Pass "100%" to fill a flex container without page scroll */
  calendarHeight?: string | number;
}

export function CalendarView({
  appointments,
  isLoading,
  error,
  onRetry,
  onDateSelect,
  onEventClick,
  onDatesChange,
  calendarHeight,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const isMobile = useIsMobile();

  const events = useMemo(
    () =>
      appointments.map((appt) => {
        const start = `${appt.date}T${appt.heure}`;
        // Calculate end from duree
        const [h, m] = appt.heure.split(":").map(Number);
        const endMin = h * 60 + m + appt.duree;
        const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
        const endM = String(endMin % 60).padStart(2, "0");
        const end = `${appt.date}T${endH}:${endM}`;

        const patientName = appt.patient?.nom_complet ?? "Walk-in";
        return {
          id: String(appt.id),
          title: `${patientName}${appt.description ? ` — ${appt.description}` : ""}`,
          start,
          end,
          backgroundColor: ETAT_COLORS[appt.etat] ?? "#6b7280",
          borderColor: ETAT_COLORS[appt.etat] ?? "#6b7280",
          extendedProps: { appointment: appt },
        };
      }),
    [appointments],
  );

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const appt = info.event.extendedProps.appointment as Appointment;
      onEventClick?.(appt);
    },
    [onEventClick],
  );

  const handleDateSelect = useCallback(
    (info: DateSelectArg) => {
      onDateSelect?.(info.startStr, info.endStr);
    },
    [onDateSelect],
  );

  return (
    <div
      className={`relative rounded-xl border bg-card p-3 shadow-sm sm:p-4 [&_.fc]:text-sm${calendarHeight ? " h-full" : ""}`}
    >
      {/* Error banner */}
      {error && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="flex-1 text-sm font-medium">
            {error}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Réessayer
            </Button>
          )}
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        locale={frLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: isMobile
            ? "timeGridDay,listWeek"
            : "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        buttonText={{
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          list: "Liste",
        }}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:15:00"
        snapDuration="00:15:00"
        allDaySlot={false}
        weekends={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={3}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        datesSet={(info) => onDatesChange?.(info.startStr, info.endStr)}
        height={calendarHeight ?? "auto"}
        aspectRatio={calendarHeight ? undefined : isMobile ? 1.2 : 1.8}
        scrollTime="08:00:00"
        loading={(isCalLoading) => {
          // FullCalendar internal loading
          void isCalLoading;
        }}
        eventContent={(arg) => (
          <div className="overflow-hidden px-1 py-0.5">
            <p className="truncate text-xs font-medium text-white">
              {arg.event.title}
            </p>
          </div>
        )}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Chargement…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
