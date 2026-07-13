import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { GlucosePeriod, Medicao } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** YYYY-MM-DD no fuso local (não use toISOString — vira dia seguinte à noite no Brasil). */
export function localDateInputValue(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Normaliza data da API para `<input type="date">`. */
export function toDateInputValue(value: string): string {
  const datePart = value.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  return localDateInputValue(new Date(value));
}

/** Interpreta data de calendário (medição) no fuso local. */
export function parseCalendarDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  const datePart = date.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return parseISO(date);
}

export function formatDateBR(date: string | Date) {
  return format(parseCalendarDate(date), "dd/MM/yyyy", { locale: ptBR });
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

const PERIOD_ORDER = new Map(GLUCOSE_PERIODS.map((p, i) => [p.value, i]));

export function calendarDateKey(date: string | Date): string {
  return format(parseCalendarDate(date), "yyyy-MM-dd");
}

export function compareMarkingsByDate(a: Medicao, b: Medicao, desc = false): number {
  const dateA = parseCalendarDate(a.date).getTime();
  const dateB = parseCalendarDate(b.date).getTime();
  if (dateA !== dateB) return desc ? dateB - dateA : dateA - dateB;

  const periodA = PERIOD_ORDER.get(a.period) ?? 99;
  const periodB = PERIOD_ORDER.get(b.period) ?? 99;
  if (periodA !== periodB) return periodA - periodB;

  if (a.createdAt && b.createdAt) {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }

  return 0;
}

export function sortMarkingsByDate(markings: Medicao[], desc = false): Medicao[] {
  return [...markings].sort((a, b) => compareMarkingsByDate(a, b, desc));
}

export interface MarkingDateGroup {
  dateKey: string;
  dateLabel: string;
  items: Medicao[];
}

/** Agrupa medições por dia; dentro de cada dia: Jejum → Café → Almoço → Jantar. */
export function groupMarkingsByDate(markings: Medicao[], desc = true): MarkingDateGroup[] {
  const sorted = sortMarkingsByDate(markings, desc);
  const groups: MarkingDateGroup[] = [];

  for (const m of sorted) {
    const dateKey = calendarDateKey(m.date);
    const last = groups[groups.length - 1];
    if (last?.dateKey === dateKey) {
      last.items.push(m);
    } else {
      groups.push({ dateKey, dateLabel: formatDateBR(m.date), items: [m] });
    }
  }

  return groups;
}

export function formatChartDateLabel(m: Medicao, markings: Medicao[]): string {
  const dayLabel = format(parseCalendarDate(m.date), "dd/MM", { locale: ptBR });
  const key = calendarDateKey(m.date);
  const sameDay = markings.filter((item) => calendarDateKey(item.date) === key).length;
  if (sameDay > 1) return `${dayLabel} · ${m.period}`;
  return dayLabel;
}

export const GLUCOSE_TARGETS = {
  jejum: 95,
  pos1h: 179,
  pos2h: 152,
} as const;

export const TARGET_INFO =
  "Meta gestacional: jejum < 95 mg/dL, 1h após refeição < 179 mg/dL, 2h ≤ 152 mg/dL.";
