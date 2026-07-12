import type { GlucosePeriod } from "@/types";
import type { GlucoseTargets } from "@/lib/premium";
import { DEFAULT_GLUCOSE_TARGETS } from "@/lib/premium";

export type GlucoseStatus = "normal" | "warning" | "danger";

export function resolveGlucoseTargets(targets?: Partial<GlucoseTargets> | null): GlucoseTargets {
  return {
    jejum: targets?.jejum ?? DEFAULT_GLUCOSE_TARGETS.jejum,
    pos1h: targets?.pos1h ?? DEFAULT_GLUCOSE_TARGETS.pos1h,
    pos2h: targets?.pos2h ?? DEFAULT_GLUCOSE_TARGETS.pos2h,
  };
}

export function getGlucoseStatus(
  value: number,
  period: GlucosePeriod,
  targets: GlucoseTargets = DEFAULT_GLUCOSE_TARGETS
): GlucoseStatus {
  if (period === "Jejum") {
    if (value < targets.jejum) return "normal";
    if (value <= targets.jejum + 10) return "warning";
    return "danger";
  }
  if (value < targets.pos1h) return "normal";
  if (value <= targets.pos1h + 20) return "warning";
  return "danger";
}

export function formatTargetsLine(targets: GlucoseTargets): string {
  return `Metas: jejum < ${targets.jejum} mg/dL · 1h pós-refeição < ${targets.pos1h} mg/dL · 2h ≤ ${targets.pos2h} mg/dL`;
}

export function getStatusColor(status: GlucoseStatus) {
  switch (status) {
    case "normal":
      return "text-glucose-normal bg-green-50 border-green-200";
    case "warning":
      return "text-glucose-warning bg-amber-50 border-amber-200";
    case "danger":
      return "text-glucose-danger bg-red-50 border-red-200";
  }
}

export function getStatusLabel(status: GlucoseStatus) {
  switch (status) {
    case "normal":
      return "Dentro da meta";
    case "warning":
      return "Atenção";
    case "danger":
      return "Acima da meta";
  }
}

export function calcAverage(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
