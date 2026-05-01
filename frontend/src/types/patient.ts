export type Genre = "Homme" | "Femme" | "Autre";

export interface Patient {
  id: number;
  numero_dossier: string;
  nom_complet: string;
  cin: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  ville: string | null;
  profession: string | null;
  genre: Genre | null;
  telephone: string;
  adresse: string | null;
  email: string | null;
  type_couverture: string | null;
  observation: string | null;
  type_dossier: string | null;
  id_dossier: string | null;
  type: "digital" | "physical";
  active: boolean;
  date_inscription: string;
  photo_url: string | null;
  consent_signed_at: string | null;
  created_at: string;
  updated_at: string;
  // computed by API
  age?: number;
  consultations_count?: number;
  derniere_consultation?: string | null;
}

export interface PatientListResponse {
  data: Patient[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface CreatePatientPayload {
  nom_complet: string;
  telephone: string;
  cin?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  ville?: string;
  profession?: string;
  genre?: Genre;
  adresse?: string;
  email?: string;
  type_couverture?: string;
  observation?: string;
  type_dossier?: string;
  id_dossier?: string;
  type?: "digital" | "physical";
  consent_signed?: boolean;
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;
