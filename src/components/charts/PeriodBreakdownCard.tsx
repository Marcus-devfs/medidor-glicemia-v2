"use client";

import { Card } from "@/components/ui/Card";
import {
  calcAverage,
  getGlucoseStatus,
  getStatusColor,
  getStatusLabel,
} from "@/lib/glucose";
import type { GlucoseTargets } from "@/lib/premium";
import { cn, GLUCOSE_PERIODS } from "@/lib/utils";
import type { Medicao } from "@/types";

interface PeriodBreakdownCardProps {
  markings: Medicao[];
  targets: GlucoseTargets;
  title?: string;
}

export function PeriodBreakdownCard({
  markings,
  targets,
  title = "Resumo por período",
}: PeriodBreakdownCardProps) {
  const total = markings.length;

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-700 text-white text-xs">
              <th className="px-3 py-2 text-left font-semibold">Período</th>
              <th className="px-3 py-2 text-center font-semibold">Nº medições</th>
              <th className="px-3 py-2 text-center font-semibold">% do total</th>
              <th className="px-3 py-2 text-center font-semibold">Média</th>
              <th className="px-3 py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {GLUCOSE_PERIODS.map(({ value: period }, i) => {
              const items = markings.filter((m) => m.period === period);
              const avg = calcAverage(items.map((m) => m.value));
              const status = avg > 0 ? getGlucoseStatus(avg, period, targets) : null;
              const pct =
                total > 0 && items.length > 0
                  ? Math.round((items.length / total) * 100)
                  : null;
              return (
                <tr key={period} className={cn(i % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                  <td className="px-3 py-2.5 text-gray-700">{period}</td>
                  <td className="px-3 py-2.5 text-center text-gray-600">
                    {items.length || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600">
                    {pct != null ? `${pct}%` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-900">
                    {avg > 0 ? `${avg} mg/dL` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {status && (
                      <span
                        className={cn(
                          "inline-block text-xs rounded-full px-2 py-0.5 border whitespace-nowrap",
                          getStatusColor(status)
                        )}
                      >
                        {getStatusLabel(status)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {total > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          % calculado sobre {total} medição{total === 1 ? "" : "ões"} do período filtrado
        </p>
      )}
    </Card>
  );
}
