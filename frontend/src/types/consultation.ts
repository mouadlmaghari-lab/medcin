export interface Consultation {
  id: number;
  patient_id: number;
  patient?: {
    id: number;
    nom_complet: string;
    numero_dossier: string;
  };
  appointment_id: number | null;

  // Date
  date_consultation: string; // ISO date

  // Vitals
  poids: number | null;                // kg       — max 500
  taille: number | null;               // cm       — max 300
  imc: number | null;                  // calculated client-side, not sent to API
  tension_systolique: number | null;   // mmHg     — max 300
  tension_diastolique: number | null;  // mmHg     — max 200
  temperature: number | null;          // °C       — [30, 45]
  saturation_o2: number | null;        // %        — max 100
  frequence_cardiaque: number | null;  // bpm      — max 300
  frequence_respiratoire: number | null; // /min   — max 60

  // Bilan glycémique
  glycemie: number | null;             // g/L (current blood glucose)
  glycemie_a_jeun: number | null;      // g/L
  glycemie_apres_repas: number | null; // g/L
  hba1c: number | null;                // %        — max 20
  glucagon: number | null;             // ng/mL
  glucosurie: string | null;           // "-" | "+" | "++" | "+++"
  acetone: string | null;              // "-" | "+" | "++" | "+++"

  // Paramètres spéciaux
  tt: number | null;     // T.T cm
  th: number | null;     // T.H g/L
  glogylie: string | null; // max 500 chars

  // Bilan lipidique
  cholesterol_total: number | null; // g/L
  triglycerides: number | null;     // g/L
  hdl: number | null;               // g/L
  ldl: number | null;               // g/L

  // Examen clinique & diagnostic
  examen_clinique: string | null;
  diagnostic: string | null;
  conduite_a_tenir: string | null;

  // Règlement
  prix: number | null;   // MAD — min 0
  regle: boolean;        // paid?

  // Relations (read-only, not sent to API)
  prescriptions_count?: number;
  certificates_count?: number;

  created_at: string;
  updated_at: string;
}

export interface ConsultationListResponse {
  data: Consultation[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export type CreateConsultationPayload = Omit<
  Consultation,
  | "id"
  | "patient"
  | "imc"
  | "prescriptions_count"
  | "certificates_count"
  | "created_at"
  | "updated_at"
>;
