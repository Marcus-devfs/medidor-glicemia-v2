import type { GlucosePeriod } from "@/types";
import { GLUCOSE_TARGETS } from "./utils";

export type GlucoseStatus = "normal" | "warning" | "danger";

export function getGlucoseStatus(value: number, period: GlucosePeriod): GlucoseStatus {
  if (period === "Jejum") {
    if (value < GLUCOSE_TARGETS.jejum) return "normal";
    if (value <= GLUCOSE_TARGETS.jejum + 10) return "warning";
    return "danger";
  }
  if (value < GLUCOSE_TARGETS.pos1h) return "normal";
  if (value <= GLUCOSE_TARGETS.pos1h + 20) return "warning";
  return "danger";
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
