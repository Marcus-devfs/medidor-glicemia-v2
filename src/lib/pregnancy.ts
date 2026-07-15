import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BabySex, PregnancyProfile } from "@/types";

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

export function babySexLabel(sex?: BabySex | null): string {
  switch (sex) {
    case "feminino":
      return "Menina";
    case "masculino":
      return "Menino";
    default:
      return "Ainda não informado";
  }
}

/** Artigo possessivo: "da Sofia", "do Davi", "de Luna". */
export function babyOfArticle(name: string, sex?: BabySex | null): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (sex === "feminino") return `da ${trimmed}`;
  if (sex === "masculino") return `do ${trimmed}`;
  return `de ${trimmed}`;
}

export function momOfBabyLabel(pregnancy?: PregnancyProfile | null): string | null {
  const name = pregnancy?.babyName?.trim();
  if (!name) return null;
  return `mamãe ${babyOfArticle(name, pregnancy?.babySex)}`;
}

export function babyCareSubtitle(pregnancy?: PregnancyProfile | null): string {
  const name = pregnancy?.babyName?.trim();
  if (!name) return "Cuide da sua saúde e do seu bebê";
  const sex = pregnancy?.babySex;
  if (sex === "feminino") return `Cuide de você e da ${name}`;
  if (sex === "masculino") return `Cuide de você e do ${name}`;
  return `Cuide de você e de ${name}`;
}

export function welcomeMomTitle(firstName?: string, pregnancy?: PregnancyProfile | null): string {
  const mom = momOfBabyLabel(pregnancy);
  if (mom) return `Olá, ${mom}! 💗`;
  if (firstName) return `Olá, ${firstName}! 💗`;
  return "Olá! 💗";
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
