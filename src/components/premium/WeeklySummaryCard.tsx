"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { gestationSummary } from "@/lib/pregnancy";

interface WeeklySummaryData {
  stats: {
    jejumAvg: number;
    aposAvg: number;
    inTargetPct: number;
    total: number;
    byPeriod?: { period: string; avg: number; count: number }[];
  };
  gestationalWeek: number | null;
}

export function WeeklySummaryCard() {
  const { user } = useAuth();
  const [data, setData] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.is_premium) {
      setData(null);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data: res } = await api.get<WeeklySummaryData>("/reports/weekly-summary?days=7");
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.is_premium, user?._id]);

  if (!user?.is_premium) return null;

  const gestation = gestationSummary(user.pregnancy?.dueDate, user.pregnancy?.fetusCount ?? 1);

  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <CalendarDays className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900">Resumo da semana</h3>
          <p className="text-xs text-gray-500 mt-0.5">Últimos 7 dias · Kit Consulta Premium</p>
          {gestation && <p className="text-xs text-brand-700 mt-1 font-medium">{gestation}</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-gray-400 text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculando...
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Dentro da meta", value: `${data.stats.inTargetPct}%` },
              {
                label: "Média jejum",
                value: data.stats.jejumAvg > 0 ? `${data.stats.jejumAvg}` : "—",
              },
              { label: "Medições", value: String(data.stats.total) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-brand-50 px-2 py-2.5 text-center"
              >
                <p className="text-[10px] text-gray-500">{item.label}</p>
                <p className="text-lg font-bold text-brand-700">{item.value}</p>
              </div>
            ))}
          </div>
          {data.stats.byPeriod?.some((p) => p.count > 0) && (
            <div className="flex flex-col gap-1.5">
              {data.stats.byPeriod
                ?.filter((p) => p.count > 0)
                .map((p) => (
                  <div
                    key={p.period}
                    className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-600">{p.period}</span>
                    <span className="font-semibold text-gray-900">
                      {p.avg > 0 ? `${p.avg} mg/dL` : "—"}
                      <span className="text-gray-400 font-normal text-xs ml-1">({p.count})</span>
                    </span>
                  </div>
                ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">
          Registre medições esta semana para ver o resumo.
        </p>
      )}
    </Card>
  );
}
