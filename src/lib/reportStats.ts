import type { GlucosePeriod, Medicao, User } from "@/types";
import type { PdfTemplate } from "@/lib/premium";
import { PDF_TEMPLATES } from "@/lib/premium";
import {
  calcAverage,
  getGlucoseStatus,
  resolveGlucoseTargets,
} from "@/lib/glucose";
import { parseCalendarDate, sortMarkingsByDate } from "@/lib/utils";
import type { ReportPdfStats } from "@/lib/pdf";

const POS_PERIODS: GlucosePeriod[] = ["Após Café", "Após Almoço", "Após Jantar"];

export type ChartPeriodFilter = GlucosePeriod | "all";
export type ChartDaysFilter = 7 | 15 | 30 | null;

export const CHART_DAYS_OPTIONS: { label: string; value: ChartDaysFilter }[] = [
  { label: "7 dias", value: 7 },
  { label: "15 dias", value: 15 },
  { label: "30 dias", value: 30 },
  { label: "Geral", value: null },
];

export function filterMarkingsByPeriod(markings: Medicao[], period: ChartPeriodFilter) {
  if (period === "all") return markings;
  return markings.filter((m) => m.period === period);
}

export function filterMarkingsForChart(
  markings: Medicao[],
  options: { days?: ChartDaysFilter; period?: ChartPeriodFilter; year?: string }
) {
  let filtered = markings;

  if (options.year && options.year !== "todos") {
    filtered = filtered.filter(
      (m) => parseCalendarDate(m.date).getFullYear().toString() === options.year
    );
  }

  if (options.days != null) {
    filtered = filterMarkingsByDays(filtered, options.days);
  }

  if (options.period && options.period !== "all") {
    filtered = filterMarkingsByPeriod(filtered, options.period);
  }

  return sortMarkingsByDate(filtered);
}

export function filterMarkingsByDays(markings: Medicao[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return markings.filter((m) => parseCalendarDate(m.date) >= cutoff);
}

export function filterMarkingsForTemplate(
  markings: Medicao[],
  template: PdfTemplate,
  year?: string
) {
  const tpl = PDF_TEMPLATES.find((t) => t.id === template);
  let filtered = markings;

  if (year && year !== "todos") {
    filtered = filtered.filter(
      (m) => parseCalendarDate(m.date).getFullYear().toString() === year
    );
  }

  if (tpl?.days != null) {
    filtered = filterMarkingsByDays(filtered, tpl.days);
  }

  return sortMarkingsByDate(filtered);
}

export function computeReportStats(markings: Medicao[], user?: User | null): ReportPdfStats {
  const targets = resolveGlucoseTargets(user?.glucoseTargets);
  const jejumValues = markings.filter((m) => m.period === "Jejum").map((m) => m.value);
  const posValues = markings.filter((m) => POS_PERIODS.includes(m.period)).map((m) => m.value);
  const inTarget = markings.filter(
    (m) => getGlucoseStatus(m.value, m.period, targets) === "normal"
  ).length;
  const total = markings.length;

  return {
    jejumAvg: calcAverage(jejumValues),
    aposAvg: calcAverage(posValues),
    inTargetPct: total ? Math.round((inTarget / total) * 100) : 0,
    total,
  };
}

export function getTemplateLabel(template: PdfTemplate) {
  return PDF_TEMPLATES.find((t) => t.id === template)?.label ?? template;
}
