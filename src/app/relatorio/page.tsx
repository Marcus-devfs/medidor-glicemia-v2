"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SummaryCard } from "@/components/charts/SummaryCard";
import { ChartFilters } from "@/components/charts/ChartFilters";
import { GlucoseChart } from "@/components/charts/GlucoseChartLazy";
import { PdfLimitModal } from "@/components/premium/PdfLimitModal";
import { PremiumReturnHandler } from "@/components/premium/PremiumReturnHandler";
import { ConsultReportCard } from "@/components/premium/ConsultReportCard";
import { ShareReportCard } from "@/components/premium/ShareReportCard";
import { WeeklySummaryCard } from "@/components/premium/WeeklySummaryCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useGlucoseTargets } from "@/hooks/useGlucoseTargets";
import { api } from "@/lib/api";
import { calcAverage, formatTargetsLine, getGlucoseStatus, getStatusColor, getStatusLabel } from "@/lib/glucose";
import { usePremiumSettings } from "@/contexts/PremiumSettingsContext";
import { PREMIUM_KIT_FEATURES, type PdfTemplate } from "@/lib/premium";
import { computeReportStats, filterMarkingsForChart, filterMarkingsForTemplate, type ChartDaysFilter, type ChartPeriodFilter } from "@/lib/reportStats";
import { gestationSummary } from "@/lib/pregnancy";
import { cn, parseCalendarDate } from "@/lib/utils";
import { useRegisterPageRefresh } from "@/contexts/RefreshContext";
import type { Medicao } from "@/types";

const years = [
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "Todos", value: "todos" },
];

export default function RelatorioPage() {
  const { user, toast } = useAuth();
  const targets = useGlucoseTargets();
  const { freePdfLimit, formatPremiumPrice } = usePremiumSettings();
  const { exportPdf, exporting, showLimitModal, setShowLimitModal } = usePdfExport();
  const [year, setYear] = useState("todos");
  const [chartPeriod, setChartPeriod] = useState<ChartPeriodFilter>("all");
  const [chartDays, setChartDays] = useState<ChartDaysFilter>(null);
  const [pdfTemplate, setPdfTemplate] = useState<PdfTemplate>("consulta30");
  const [allMarkings, setAllMarkings] = useState<Medicao[]>([]);
  const [medias, setMedias] = useState({ jejum: 0, apos: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const [mediaRes, listRes] = await Promise.all([
        api.get(`/marking/list/media/${user._id}?year=${year}`),
        api.get<Medicao[]>(`/marking/list/${user._id}`),
      ]);
      const { jejum, aposLanch } = mediaRes.data;
      const jejumAvg = calcAverage(jejum.map((m: Medicao) => m.value));
      const aposAvg = calcAverage(aposLanch.map((m: Medicao) => m.value));

      let filtered = listRes.data;
      if (year !== "todos") {
        filtered = listRes.data.filter((m) =>
          parseCalendarDate(m.date).getFullYear().toString() === year
        );
      }

      setMedias({ jejum: jejumAvg, apos: aposAvg, total: filtered.length });
      setAllMarkings(filtered);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [user?._id, year]);

  useEffect(() => {
    load();
  }, [load]);

  useRegisterPageRefresh(load);

  const exportMarkings = useMemo(
    () => filterMarkingsForTemplate(allMarkings, pdfTemplate, year),
    [allMarkings, pdfTemplate, year]
  );

  const chartMarkings = useMemo(
    () => filterMarkingsForChart(allMarkings, { days: chartDays, period: chartPeriod, year }),
    [allMarkings, chartDays, chartPeriod, year]
  );

  const inTarget = chartMarkings.filter(
    (m) => getGlucoseStatus(m.value, m.period, targets) === "normal"
  ).length;
  const pct = chartMarkings.length ? Math.round((inTarget / chartMarkings.length) * 100) : 0;

  const gestationLine = gestationSummary(
    user?.pregnancy?.dueDate,
    user?.pregnancy?.fetusCount ?? 1
  );

  const handleExportPdf = () => {
    if (!exportMarkings.length) {
      toast("Nenhuma medição no período selecionado", "error");
      return;
    }
    exportPdf(exportMarkings, {
      year,
      template: pdfTemplate,
      stats: computeReportStats(exportMarkings, user),
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <Suspense fallback={null}>
        <PremiumReturnHandler />
      </Suspense>
      <Header title="Relatório" subtitle="Kit consulta · acompanhe sua evolução" />

      <main className="flex flex-col gap-5 px-4 pb-4">
        {gestationLine && (
          <Card className="bg-brand-50 border-brand-100 py-3">
            <p className="text-sm font-medium text-brand-800 text-center">{gestationLine}</p>
          </Card>
        )}

        <WeeklySummaryCard />

        <ConsultReportCard
          user={user}
          pdfTemplate={pdfTemplate}
          onTemplateChange={setPdfTemplate}
          onNeedPremium={() => setShowLimitModal(true)}
          exportCount={exportMarkings.length}
          loading={loading}
          exporting={exporting}
          onExport={handleExportPdf}
          freePdfLimit={freePdfLimit}
          formatPremiumPrice={formatPremiumPrice}
        />

        <ShareReportCard onNeedPremium={() => setShowLimitModal(true)} />

        {!user?.is_premium && (
          <Card className="border-brand-100 bg-brand-50/50">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Kit Consulta Premium</h3>
            <ul className="flex flex-col gap-1.5">
              {PREMIUM_KIT_FEATURES.map((item) => (
                <li key={item} className="text-xs text-gray-600 leading-relaxed flex gap-2">
                  <span className="text-brand-600 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button
              className="mt-3"
              fullWidth
              variant="secondary"
              onClick={() => setShowLimitModal(true)}
            >
              Desbloquear por {formatPremiumPrice()}
            </Button>
          </Card>
        )}

        <div className="flex gap-2">
          {years.map((y) => (
            <button
              key={y.value}
              onClick={() => setYear(y.value)}
              className={cn(
                "flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-all",
                year === y.value
                  ? "border-brand-500 bg-brand-600 text-white"
                  : "border-gray-200 bg-white text-gray-600"
              )}
            >
              {y.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="Média Jejum" value={medias.jejum} period="Jejum" icon="🌅" />
          <SummaryCard label="Média Pós-refeição" value={medias.apos} period="Após Café" icon="🍽️" />
        </div>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900">Gráfico de evolução</h3>
            <ChartFilters
              period={chartPeriod}
              days={chartDays}
              onPeriodChange={setChartPeriod}
              onDaysChange={setChartDays}
            />
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
          ) : (
            <GlucoseChart data={chartMarkings} />
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Controle geral</h3>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fce7f3" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#db2777" strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-brand-700">
                {pct}%
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Dentro da meta</p>
              <p className="text-xs text-gray-500 mt-1">
                {inTarget} de {chartMarkings.length} medições no período filtrado.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Distribuição por período</h3>
          {["Jejum", "Após Café", "Após Almoço", "Após Jantar"].map((period) => {
            const items = chartMarkings.filter((m) => m.period === period);
            const avg = calcAverage(items.map((m) => m.value));
            const status = avg > 0 ? getGlucoseStatus(avg, period as Medicao["period"], targets) : null;
            const total = chartMarkings.length;
            const pct =
              total > 0 && items.length > 0
                ? Math.round((items.length / total) * 100)
                : null;
            return (
              <div key={period} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 gap-2">
                <div className="min-w-0">
                  <span className="text-sm text-gray-600">{period}</span>
                  {pct != null && (
                    <p className="text-[11px] text-gray-400">
                      {items.length} de {total} · {pct}%
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">{avg > 0 ? `${avg} mg/dL` : "—"}</span>
                  {status && (
                    <span className={cn("text-xs rounded-full px-2 py-0.5 border", getStatusColor(status))}>
                      {getStatusLabel(status)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </Card>

        <p className="text-xs text-center text-gray-400 px-2 leading-relaxed">
          {formatTargetsLine(targets)}
        </p>
      </main>

      <PdfLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}
