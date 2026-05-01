export interface InvoiceLine {
  description: string;
  quantite: number;
  prix_unitaire_ht: number;
  tva: number; // percentage e.g. 0, 7, 10, 20
  montant_ht: number;
  montant_ttc: number;
}

export interface Invoice {
  id: number;
  numero: string; // FACT-2026-XXXX
  patient_id: number;
  consultation_id: number | null;
  patient?: {
    id: number;
    nom_complet: string;
    numero_dossier: string;
    adresse?: string;
    ville?: string;
    cin?: string;
  };
  date_facture: string;
  echeance: string | null;
  lignes: InvoiceLine[];
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  statut: "brouillon" | "emise" | "payee" | "annulee";
  notes: string | null;
  created_at: string;
}

export interface CreateInvoicePayload {
  patient_id: number;
  consultation_id?: number | null;
  date_facture: string;
  echeance?: string;
  lignes: Omit<InvoiceLine, "montant_ht" | "montant_ttc">[];
  notes?: string;
}

export type ExpenseCategory =
  | "loyer"
  | "charges"
  | "materiel"
  | "consommables"
  | "formation"
  | "logiciel"
  | "assurance"
  | "personnel"
  | "autre";

export interface Expense {
  id: number;
  categorie: ExpenseCategory;
  description: string;
  montant: number;
  date_depense: string;
  fournisseur: string | null;
  reference: string | null;
  recu_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateExpensePayload {
  categorie: ExpenseCategory;
  description: string;
  montant: number;
  date_depense: string;
  fournisseur?: string;
  reference?: string;
  notes?: string;
}
