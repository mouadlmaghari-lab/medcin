export type PaymentMethod =
  | "especes"
  | "carte"
  | "cheque"
  | "virement"
  | "assurance";

export interface Payment {
  id: number;
  patient_id: number;
  consultation_id: number | null;
  invoice_id: number | null;
  patient?: {
    id: number;
    nom_complet: string;
    numero_dossier: string;
  };
  montant: number; // MAD
  montant_du: number; // amount owed
  montant_paye: number; // amount paid
  solde: number; // remaining balance
  mode_paiement: PaymentMethod;
  date_paiement: string;
  reference: string | null; // check / transfer reference
  notes: string | null;
  created_at: string;
}

export interface CreatePaymentPayload {
  patient_id: number;
  consultation_id?: number | null;
  invoice_id?: number | null;
  montant_du: number;
  montant_paye: number;
  mode_paiement: PaymentMethod;
  date_paiement: string;
  reference?: string;
  notes?: string;
}
