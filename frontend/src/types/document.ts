// ── Medical Documents types ───────────────────────────────────────────────────

import type { Patient } from "./patient";

// ── Medical Report ────────────────────────────────────────────────────────────
export interface MedicalReport {
  id: number;
  patient_id: number;
  patient: Pick<Patient, "id" | "nom_complet" | "numero_dossier"> | null;
  titre: string;
  contenu: string;
  date_rapport: string; // "YYYY-MM-DD"
  partage_patient: boolean;
  pdf_path: string | null;
  created_at: string;
}

export interface CreateReportPayload {
  patient_id: number;
  titre: string;
  contenu: string;
  date_rapport: string;
  partage_patient?: boolean;
}

export interface PaginatedReports {
  data: MedicalReport[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// ── Expertise ─────────────────────────────────────────────────────────────────
export type ExpertiseStatut = "en_cours" | "termine";

export interface ExpertiseAttachment {
  id: number;
  file_name: string;
  media_type: string;
  file_size: number;
}

export interface Expertise {
  id: number;
  patient_id: number;
  patient: Pick<Patient, "id" | "nom_complet" | "numero_dossier"> | null;
  titre: string;
  contenu: string | null;
  date_expertise: string; // "YYYY-MM-DD"
  statut: ExpertiseStatut;
  pdf_path: string | null;
  attachments: ExpertiseAttachment[];
  created_at: string;
}

export interface CreateExpertisePayload {
  patient_id: number;
  titre: string;
  contenu?: string;
  date_expertise: string;
  statut?: ExpertiseStatut;
}

export interface PaginatedExpertises {
  data: Expertise[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// ── Evolution ─────────────────────────────────────────────────────────────────
export interface Evolution {
  id: number;
  patient_id: number;
  date_evolution: string;
  note: string;
  type: string | null;
  created_at: string;
}

export interface CreateEvolutionPayload {
  patient_id: number;
  date_evolution: string;
  note: string;
  type?: string;
}
