"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Baby, Heart, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { GlucoseChart } from "@/components/charts/GlucoseChartLazy";
import { api } from "@/lib/api";
import { formatDueDate } from "@/lib/pregnancy";
import { formatDateBR } from "@/lib/utils";
import type { Medicao } from "@/types";

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
    byPeriod?: { period: string; avg: number; count: number }[];
  };
  markings: { date: string; period: string; value: number }[];
  expiresAt: string;
}

export default function CompartilharPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<SharedReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const chartData: Medicao[] = data.markings.map((m, i) => ({
    _id: String(i),
    period: m.period as Medicao["period"],
    value: m.value,
    date: m.date,
    diet: false,
    userId: "",
  }));

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

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Dentro da meta", value: `${data.stats.inTargetPct}%` },
            { label: "Média jejum", value: data.stats.jejumAvg || "—" },
            { label: "Medições", value: data.stats.total },
          ].map((item) => (
            <Card key={item.label} className="text-center py-3">
              <p className="text-[10px] text-gray-500">{item.label}</p>
              <p className="text-xl font-bold text-brand-700">{item.value}</p>
            </Card>
          ))}
        </div>

        {chartData.length > 0 && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Últimos 14 dias</h2>
            <GlucoseChart data={chartData} />
          </Card>
        )}

        <Card>
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Registro recente</h2>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {data.markings.slice(0, 40).map((m, i) => (
              <div
                key={i}
                className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
              >
                <span className="text-gray-500">
                  {formatDateBR(m.date)} · {m.period}
                </span>
                <span className="font-semibold text-gray-900">{m.value} mg/dL</span>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-xs text-center text-gray-400 leading-relaxed px-2">
          Metas: jejum &lt; {data.targets.jejum} · 1h &lt; {data.targets.pos1h} · 2h ≤{" "}
          {data.targets.pos2h} mg/dL. Link válido até{" "}
          {new Date(data.expiresAt).toLocaleDateString("pt-BR")}.
        </p>

        <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
          <Heart className="h-3 w-3 text-brand-400 fill-brand-400" />
          gestaglic.com.br
        </div>
      </main>
    </div>
  );
}
