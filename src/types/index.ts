export type GlucosePeriod = "Jejum" | "Após Café" | "Após Almoço" | "Após Jantar";

export type BabySex = "feminino" | "masculino" | "nao_informado";

export interface PregnancyProfile {
  dueDate?: string | null;
  fetusCount?: number;
  babyName?: string | null;
  babySex?: BabySex | null;
}

export interface GlucoseTargets {
  jejum: number;
  pos1h: number;
  pos2h: number;
}

export interface UserPreferences {
  notificationsEnabled?: boolean;
  weeklySummaryEmail?: boolean;
  dismissedAnnouncementIds?: string[];
}

export interface AppAnnouncement {
  _id: string;
  title: string;
  body: string;
  kind: "feature" | "campaign" | "info";
  ctaLabel?: string | null;
  ctaHref?: string | null;
  publishedAt?: string;
}

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
  pregnancy?: PregnancyProfile;
  glucoseTargets?: GlucoseTargets;
  preferences?: UserPreferences;
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
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedHealthData: boolean;
}

export interface ArticlePreview {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readMinutes: number;
}

export type ForumCategory = "Alimentação" | "Ansiedade" | "Sintomas" | "Vitórias";

export interface ForumPost {
  _id: string;
  title: string;
  body: string;
  category: ForumCategory;
  likesCount: number;
  commentsCount: number;
  supported?: boolean;
  userId: { _id: string; name: string };
  createdAt: string;
}

export interface ForumComment {
  _id: string;
  body: string;
  userId: { _id: string; name: string };
  createdAt: string;
}
