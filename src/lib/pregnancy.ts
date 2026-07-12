import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Semana gestacional a partir da DPP (40 semanas = 280 dias). */
export function getGestationalWeek(dueDate?: string | null): number | null {
  if (!dueDate) return null;
  const dpp = parseISO(dueDate.split("T")[0]);
  const today = new Date();
  const daysToDpp = differenceInDays(dpp, today);
  const daysPregnant = 280 - daysToDpp;
  const week = Math.floor(daysPregnant / 7);
  if (week < 1 || week > 42) return null;
  return week;
}

export function formatDueDate(dueDate?: string | null): string {
  if (!dueDate) return "";
  return format(parseISO(dueDate.split("T")[0]), "dd/MM/yyyy", { locale: ptBR });
}

export function fetusCountLabel(count: number): string {
  if (count <= 1) return "1 feto (gestação única)";
  if (count === 2) return "2 fetos (gestação gemelar)";
  return `${count} fetos`;
}

export function gestationSummary(dueDate?: string | null, fetusCount = 1): string | null {
  const week = getGestationalWeek(dueDate);
  if (week == null && !dueDate) return null;

  const parts: string[] = [];
  if (week != null) parts.push(`${week}ª semana`);
  if (dueDate) parts.push(`DPP ${formatDueDate(dueDate)}`);
  if (fetusCount > 1) parts.push(fetusCountLabel(fetusCount));
  return parts.join(" · ");
}
