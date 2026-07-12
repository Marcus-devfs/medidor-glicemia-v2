"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Medicao } from "@/types";
import { useGlucoseTargets } from "@/hooks/useGlucoseTargets";
import { parseCalendarDate } from "@/lib/utils";

interface GlucoseChartProps {
  data: Medicao[];
}

export function GlucoseChart({ data }: GlucoseChartProps) {
  const targets = useGlucoseTargets();
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14)
    .map((m) => ({
      date: format(parseCalendarDate(m.date), "dd/MM", { locale: ptBR }),
      value: m.value,
      period: m.period,
    }));

  if (!chartData.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Sem dados para exibir no gráfico
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[60, 220]} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #fbcfe8", fontSize: 13 }}
          formatter={(value, _name, props) => [
            `${value} mg/dL`,
            (props.payload as { period: string }).period,
          ]}
        />
        <ReferenceLine y={targets.jejum} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Meta jejum", fontSize: 10, fill: "#22c55e" }} />
        <ReferenceLine y={targets.pos1h} stroke="#f59e0b" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#db2777"
          strokeWidth={2.5}
          dot={{ fill: "#db2777", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
