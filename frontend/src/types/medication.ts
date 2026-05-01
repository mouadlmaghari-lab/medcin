// ── Medication catalog & stock types ─────────────────────────────────────────

export type MedicationForme =
  | "comprime"
  | "gelule"
  | "sirop"
  | "injection"
  | "creme"
  | "pommade"
  | "suppositoire"
  | "gouttes"
  | "spray"
  | "patch"
  | "autre";

export interface Medication {
  id: number;
  nom: string;
  nom_generique: string | null;
  categorie: string | null;
  forme: MedicationForme | string | null;
  unite: string | null;
  prix_achat: number | null;
  prix_vente: number | null;
  stock_qty: number;
  stock_alerte_min: number;
  is_low_stock: boolean;
  date_expiration: string | null;   // "YYYY-MM-DD"
  is_expired: boolean;
  code_barre: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface CreateMedicationPayload {
  nom: string;
  nom_generique?: string;
  categorie?: string;
  forme?: string;
  unite?: string;
  prix_achat?: number;
  prix_vente?: number;
  stock_qty?: number;
  stock_alerte_min?: number;
  date_expiration?: string;
  code_barre?: string;
  notes?: string;
}

export type UpdateMedicationPayload = Partial<CreateMedicationPayload>;

export interface PaginatedMedications {
  data: Medication[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface MedicationFilters {
  search?: string;
  categorie?: string;
  low_stock?: boolean;
  expiring_soon?: boolean;
  active?: boolean;
  per_page?: number;
  page?: number;
}

// Common medication categories used in Moroccan clinics
export const MEDICATION_CATEGORIES = [
  { value: "antibiotiques",       label: "Antibiotiques" },
  { value: "antalgiques",         label: "Antalgiques / Antidouleurs" },
  { value: "anti_inflammatoires", label: "Anti-inflammatoires" },
  { value: "cardiologie",         label: "Cardiologie" },
  { value: "diabetologie",        label: "Diabétologie" },
  { value: "pneumologie",         label: "Pneumologie" },
  { value: "gastro_enterologie",  label: "Gastro-entérologie" },
  { value: "dermatologie",        label: "Dermatologie" },
  { value: "ophtalmologie",       label: "Ophtalmologie" },
  { value: "orl",                 label: "ORL" },
  { value: "neurologie",          label: "Neurologie" },
  { value: "vitamines",           label: "Vitamines / Compléments" },
  { value: "autre",               label: "Autre" },
] as const;

export const MEDICATION_FORMES = [
  { value: "comprime",     label: "Comprimé" },
  { value: "gelule",       label: "Gélule" },
  { value: "sirop",        label: "Sirop" },
  { value: "injection",    label: "Injectable" },
  { value: "creme",        label: "Crème" },
  { value: "pommade",      label: "Pommade" },
  { value: "suppositoire", label: "Suppositoire" },
  { value: "gouttes",      label: "Gouttes" },
  { value: "spray",        label: "Spray" },
  { value: "patch",        label: "Patch" },
  { value: "autre",        label: "Autre" },
] as const;

export const MEDICATION_UNITES = [
  { value: "cp",      label: "cp (comprimé)" },
  { value: "ml",      label: "ml" },
  { value: "mg",      label: "mg" },
  { value: "g",       label: "g" },
  { value: "UI",      label: "UI" },
  { value: "ampoule", label: "Ampoule" },
  { value: "sachet",  label: "Sachet" },
  { value: "flacon",  label: "Flacon" },
  { value: "tube",    label: "Tube" },
] as const;
