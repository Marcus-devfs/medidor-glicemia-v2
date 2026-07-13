"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Baby, Heart, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ChartFilters } from "@/components/charts/ChartFilters";
import { GlucoseChart } from "@/components/charts/GlucoseChartLazy";
import { PeriodBreakdownCard } from "@/components/charts/PeriodBreakdownCard";
import { SummaryCard } from "@/components/charts/SummaryCard";
import { api } from "@/lib/api";
import {
  calcAverage,
  formatTargetsLine,
  getGlucoseStatus,
} from "@/lib/glucose";
import { formatDueDate } from "@/lib/pregnancy";
import {
  filterMarkingsForChart,
  type ChartDaysFilter,
  type ChartPeriodFilter,
} from "@/lib/reportStats";
import { formatDateBR, groupMarkingsByDate } from "@/lib/utils";
import type { GlucosePeriod, Medicao } from "@/types";

interface SharedReport {
  patientName: string;
  gestationalWeek: number | null;
  pregnancy: { dueDate: string | null; fetusCount: number };
  targets: { jejum: number; pos1h: number; pos2h: number };
  stats: {
    jejumAvg: number;
    aposAvg: number;
    inTargetPct: number;
    total: number;
  };
  markings: { date: string; period: string; value: number }[];
  expiresAt: string;
}

const POS_PERIODS: GlucosePeriod[] = ["Após Café", "Após Almoço", "Após Jantar"];

function toMedicao(markings: SharedReport["markings"]): Medicao[] {
  return markings.map((m, i) => ({
    _id: String(i),
    period: m.period as Medicao["period"],
    value: m.value,
    date: m.date,
    diet: false,
    userId: "",
  }));
}

export default function CompartilharPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<SharedReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriodFilter>("all");
  const [chartDays, setChartDays] = useState<ChartDaysFilter>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: res } = await api.get<SharedReport>(`/reports/share/${token}`);
        setData(res);
      } catch {
        setError("Link expirado ou inválido.");
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  const allMarkings = useMemo(() => (data ? toMedicao(data.markings) : []), [data]);

  const filteredMarkings = useMemo(
    () => filterMarkingsForChart(allMarkings, { days: chartDays, period: chartPeriod }),
    [allMarkings, chartDays, chartPeriod]
  );

  const filteredStats = useMemo(() => {
    if (!data) return { jejumAvg: 0, aposAvg: 0, inTargetPct: 0, total: 0, inTarget: 0 };
    const targets = data.targets;
    const jejumValues = filteredMarkings
      .filter((m) => m.period === "Jejum")
      .map((m) => m.value);
    const posValues = filteredMarkings
      .filter((m) => POS_PERIODS.includes(m.period))
      .map((m) => m.value);
    const inTarget = filteredMarkings.filter(
      (m) => getGlucoseStatus(m.value, m.period, targets) === "normal"
    ).length;
    const total = filteredMarkings.length;
    return {
      jejumAvg: calcAverage(jejumValues),
      aposAvg: calcAverage(posValues),
      inTargetPct: total ? Math.round((inTarget / total) * 100) : 0,
      inTarget,
      total,
    };
  }, [data, filteredMarkings]);

  const groupedMarkings = useMemo(
    () => groupMarkingsByDate(filteredMarkings, true),
    [filteredMarkings]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <p className="text-sm text-gray-500">Carregando relatório...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50 px-4 text-center">
        <p className="text-gray-700 font-medium">{error || "Relatório não encontrado"}</p>
        <p className="text-sm text-gray-500 mt-2">Peça à paciente um novo link no app GestaGlic.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50 pb-10">
      <header className="bg-brand-600 text-white px-4 py-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-2 text-brand-100 text-xs font-semibold uppercase tracking-wide mb-2">
            <Stethoscope className="h-4 w-4" />
            Relatório compartilhado · uso médico
          </div>
          <h1 className="text-xl font-bold">{data.patientName}</h1>
          <p className="text-sm text-brand-100 mt-1">GestaGlic — glicemia gestacional</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 flex flex-col gap-4 -mt-3">
        <Card>
          <div className="flex items-start gap-3">
            <Baby className="h-5 w-5 text-brand-600 shrink-0" />
            <div className="text-sm text-gray-700">
              {data.gestationalWeek != null && (
                <p>
                  <strong>{data.gestationalWeek}ª semana</strong> gestacional
                </p>
              )}
              {data.pregnancy.dueDate && (
                <p className="text-gray-500 mt-0.5">DPP {formatDueDate(data.pregnancy.dueDate)}</p>
              )}
              {data.pregnancy.fetusCount > 1 && (
                <p className="text-gray-500">{data.pregnancy.fetusCount} fetos</p>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label="Média Jejum"
            value={filteredStats.jejumAvg}
            period="Jejum"
            icon="🌅"
            targets={data.targets}
          />
          <SummaryCard
            label="Média Pós-refeição"
            value={filteredStats.aposAvg}
            period="Após Café"
            icon="🍽️"
            targets={data.targets}
          />
        </div>

        {allMarkings.length > 0 && (
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-gray-900 text-sm">Gráfico de evolução</h2>
              <ChartFilters
                period={chartPeriod}
                days={chartDays}
                onPeriodChange={setChartPeriod}
                onDaysChange={setChartDays}
              />
            </div>
            <GlucoseChart data={filteredMarkings} targets={data.targets} />
          </Card>
        )}

        <Card>
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Controle geral</h2>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fce7f3" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#db2777"
                  strokeWidth="3"
                  strokeDasharray={`${filteredStats.inTargetPct} ${100 - filteredStats.inTargetPct}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-brand-700">
                {filteredStats.inTargetPct}%
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Dentro da meta</p>
              <p className="text-xs text-gray-500 mt-1">
                {filteredStats.inTarget} de {filteredStats.total} medições no período filtrado.
              </p>
            </div>
          </div>
        </Card>

        <PeriodBreakdownCard markings={filteredMarkings} targets={data.targets} />

        {groupedMarkings.length > 0 && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Registro de medições</h2>
            <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
              {groupedMarkings.map((group) => (
                <section key={group.dateKey} className="flex flex-col gap-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-0.5">
                    {group.dateLabel}
                  </h3>
                  {group.items.map((m) => (
                    <div
                      key={m._id}
                      className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-500">{m.period}</span>
                      <span className="font-semibold text-gray-900">{m.value} mg/dL</span>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </Card>
        )}

        <p className="text-xs text-center text-gray-400 leading-relaxed px-2">
          {formatTargetsLine(data.targets)}. Link válido até{" "}
          {formatDateBR(data.expiresAt)}.
        </p>

        <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
          <Heart className="h-3 w-3 text-brand-400 fill-brand-400" />
          gestaglic.com.br
        </div>
      </main>
    </div>
  );
}
