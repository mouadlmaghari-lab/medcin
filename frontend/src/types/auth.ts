export type UserRole = "doctor" | "secretary";

export interface User {
  id: number;
  name: string;
  nom_complet?: string;
  email: string;
  role: UserRole;
  language: "fr" | "ar" | "en";
  specialite?: string;
  tenant_id?: number;
  two_factor_enabled?: boolean;
  avatar?: string;
  phone?: string;
  cabinet?: {
    name: string;
    address?: string;
    phone?: string;
    logo?: string;
    inpe?: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface TwoFactorPayload {
  code: string;
  temp_token: string;
}
