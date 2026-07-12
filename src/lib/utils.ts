import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { GlucosePeriod } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateBR(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTimeBR(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function getFirstName(fullName?: string) {
  if (!fullName) return "";
  return fullName.split(" ")[0];
}

export function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const GLUCOSE_PERIODS: { label: string; value: GlucosePeriod; icon: string }[] = [
  { label: "Jejum", value: "Jejum", icon: "🌅" },
  { label: "Após Café", value: "Após Café", icon: "☕" },
  { label: "Após Almoço", value: "Após Almoço", icon: "🍽️" },
  { label: "Após Jantar", value: "Após Jantar", icon: "🌙" },
];

export const GLUCOSE_TARGETS = {
  jejum: 95,
  pos1h: 179,
  pos2h: 152,
} as const;

export const TARGET_INFO =
  "Meta gestacional: jejum < 95 mg/dL, 1h após refeição < 179 mg/dL, 2h ≤ 152 mg/dL.";
