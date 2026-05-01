export interface PrescriptionItem {
  id?: number;
  medication_name: string;
  medication_id?: number | null;
  dosage: string | null;
  frequence: string | null;
  duree: string | null;
  instructions: string | null;
}

export interface Prescription {
  id: number;
  patient_id: number;
  consultation_id: number | null;
  patient?: {
    id: number;
    nom_complet: string;
    numero_dossier: string;
    date_naissance: string | null;
    sexe: string;
  };
  date_ordonnance: string;
  items: PrescriptionItem[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionPayload {
  patient_id: number;
  consultation_id?: number | null;
  date_ordonnance: string;
  items: Omit<PrescriptionItem, "id">[];
  notes?: string;
}
