export type CertificateType =
  | "repos"
  | "aptitude"
  | "inapatitude"
  | "hospitalisation"
  | "custom";

export interface Certificate {
  id: number;
  numero: string; // CERT-2026-XXXX
  patient_id: number;
  consultation_id: number | null;
  patient?: {
    id: number;
    nom_complet: string;
    numero_dossier: string;
    date_naissance: string | null;
    sexe: string;
  };
  type: CertificateType;
  date_debut: string | null;
  date_fin: string | null;
  nombre_jours: number | null;
  contenu: string; // free text / medical justification
  date_certificat: string;
  created_at: string;
}

export interface CreateCertificatePayload {
  patient_id: number;
  consultation_id?: number | null;
  type: CertificateType;
  date_debut?: string;
  date_fin?: string;
  nombre_jours?: number;
  contenu: string;
  date_certificat: string;
}
