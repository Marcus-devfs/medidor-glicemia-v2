export type GlucosePeriod = "Jejum" | "Após Café" | "Após Almoço" | "Após Jantar";

export interface User {
  _id: string;
  name: string;
  email: string;
  telephone?: string;
  gender?: string;
  birthDate?: string;
  photoPerfil?: { url: string }[];
  token?: string;
  pdf_downloads_count?: number;
  is_premium?: boolean;
}

export interface Medicao {
  _id: string;
  period: GlucosePeriod;
  value: number;
  date: string;
  diet: boolean;
  food?: string;
  userId: string;
  createdAt?: string;
}

export interface MedicaoForm {
  date: string;
  period: GlucosePeriod | "";
  value: string;
  diet: 0 | 1 | null;
  food: string;
}

export interface MediaResponse {
  jejum: Medicao[];
  aposLanch: Medicao[];
}

export interface ReminderConfig {
  enabled: boolean;
  reminders: {
    id: string;
    period: GlucosePeriod;
    time: string;
    label: string;
  }[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  telephone?: string;
  gender?: string;
  birthDate?: string;
}
