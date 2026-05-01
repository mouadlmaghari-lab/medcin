// ── Backend shapes (match API exactly) ─────────────────────────

export type AppointmentEtat =
  | "en_attente"
  | "confirme"
  | "en_cours"
  | "termine"
  | "annule"
  | "absent";

export type BookingSource = "web" | "mobile" | "walkin";

/** Shape returned by AppointmentResource (backend) */
export interface RawAppointment {
  id: number;
  patient_id: number | null;
  patient: {
    id: number;
    nom_complet: string;
    telephone: string;
    cin: string | null;
    numero_dossier: string;
    genre: string | null;
    type: string | null;
    active: boolean;
  } | null;
  created_by: number;
  patient_name: string | null;
  telephone: string | null;
  debut: string; // ISO datetime
  fin: string; // ISO datetime
  etat: AppointmentEtat;
  description: string | null;
  booking_source: BookingSource | null;
  created_at: string;
}

/** Payload for POST /api/v1/doctor/appointments */
export interface StoreAppointmentPayload {
  patient_id?: number | null;
  patient_name?: string;
  telephone?: string;
  debut: string; // ISO datetime
  fin: string; // ISO datetime
  etat?: AppointmentEtat;
  description?: string;
  booking_source?: BookingSource;
}

/** Payload for PUT /api/v1/doctor/appointments/:id */
export type UpdateAppointmentPayload = Partial<StoreAppointmentPayload>;

// ── Frontend-friendly shapes (UI layer) ──────────────────────

/** Mapped appointment for the UI (derived from RawAppointment) */
export interface Appointment {
  id: number;
  patient_id: number | null;
  patient: {
    id: number;
    nom_complet: string;
    telephone: string;
    numero_dossier: string;
  } | null;
  date: string; // YYYY-MM-DD
  heure: string; // HH:mm
  duree: number; // minutes
  etat: AppointmentEtat;
  description: string | null;
  booking_source: BookingSource | null;
  is_walk_in: boolean;
  created_at: string;
}

export interface AppointmentListResponse {
  data: RawAppointment[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

// ── Mappers ──────────────────────────────────────────────────

/** Convert backend RawAppointment → UI Appointment */
export function mapAppointment(raw: RawAppointment): Appointment {
  const debut = new Date(raw.debut);
  const fin = new Date(raw.fin);
  const duree = Math.round((fin.getTime() - debut.getTime()) / 60_000);

  return {
    id: raw.id,
    patient_id: raw.patient_id,
    patient: raw.patient
      ? {
          id: raw.patient.id,
          nom_complet: raw.patient.nom_complet,
          telephone: raw.patient.telephone,
          numero_dossier: raw.patient.numero_dossier,
        }
      : null,
    date: debut.toISOString().slice(0, 10),
    heure: `${String(debut.getHours()).padStart(2, "0")}:${String(debut.getMinutes()).padStart(2, "0")}`,
    duree,
    etat: raw.etat,
    description: raw.description,
    booking_source: raw.booking_source,
    is_walk_in: raw.booking_source === "walkin",
    created_at: raw.created_at,
  };
}

/** Build backend payload from form values */
export function buildStorePayload(form: {
  patient_id?: number | null;
  patient_name?: string;
  date: string;
  heure: string;
  duree: number;
  description?: string;
  is_walk_in: boolean;
}): StoreAppointmentPayload {
  const debut = `${form.date}T${form.heure}:00`;
  const debutDate = new Date(debut);
  const finDate = new Date(debutDate.getTime() + form.duree * 60_000);
  const fin = finDate.toISOString();

  return {
    patient_id: form.is_walk_in ? null : form.patient_id,
    patient_name: form.is_walk_in ? (form.patient_name ?? "Walk-in") : undefined,
    debut,
    fin,
    etat: "en_attente",
    description: form.description || undefined,
    booking_source: form.is_walk_in ? "walkin" : "web",
  };
}
