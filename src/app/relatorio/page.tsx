"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SummaryCard } from "@/components/charts/SummaryCard";
import { GlucoseChart } from "@/components/charts/GlucoseChartLazy";
import { PdfLimitModal } from "@/components/premium/PdfLimitModal";
import { PremiumReturnHandler } from "@/components/premium/PremiumReturnHandler";
import { PdfTemplatePicker } from "@/components/premium/PdfTemplatePicker";
import { ShareReportCard } from "@/components/premium/ShareReportCard";
import { WeeklySummaryCard } from "@/components/premium/WeeklySummaryCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useGlucoseTargets } from "@/hooks/useGlucoseTargets";
import { api } from "@/lib/api";
import { calcAverage, formatTargetsLine, getGlucoseStatus, getStatusColor, getStatusLabel } from "@/lib/glucose";
import { usePremiumSettings } from "@/contexts/PremiumSettingsContext";
import { PREMIUM_KIT_FEATURES, PREMIUM_ONE_TIME_NOTE, type PdfTemplate } from "@/lib/premium";
import { computeReportStats, filterMarkingsForTemplate } from "@/lib/reportStats";
import { gestationSummary } from "@/lib/pregnancy";
import { cn } from "@/lib/utils";
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
  const [pdfTemplate, setPdfTemplate] = useState<PdfTemplate>("completo");
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
          new Date(m.date).getFullYear().toString() === year
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

  const inTarget = exportMarkings.filter(
    (m) => getGlucoseStatus(m.value, m.period, targets) === "normal"
  ).length;
  const pct = exportMarkings.length ? Math.round((inTarget / exportMarkings.length) * 100) : 0;

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

        <Card className="bg-gradient-to-br from-brand-600 to-brand-500 text-white border-0">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base">Relatório para consulta</h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Modelos profissionais com DPP, semana gestacional e metas personalizadas — prontos
                para sua obstetra.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white/10 p-3">
            <PdfTemplatePicker
              value={pdfTemplate}
              onChange={setPdfTemplate}
              isPremium={!!user?.is_premium}
              onNeedPremium={() => setShowLimitModal(true)}
            />
          </div>

          <Button
            onClick={handleExportPdf}
            disabled={exporting || loading || exportMarkings.length === 0}
            fullWidth
            className="mt-4 bg-white text-brand-600 hover:bg-brand-50 border-0"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Gerando PDF..." : "Baixar relatório PDF"}
          </Button>

          {exportMarkings.length === 0 && !loading && (
            <p className="text-[10px] text-white/80 text-center mt-2">
              Nenhuma medição no período selecionado.
            </p>
          )}

          {user && !user.is_premium && (user.pdf_downloads_count ?? 0) >= freePdfLimit && (
            <p className="text-[10px] text-white/90 text-center mt-2 leading-relaxed">
              Limite gratuito atingido · Kit Consulta Premium {formatPremiumPrice()}.{" "}
              {PREMIUM_ONE_TIME_NOTE}
            </p>
          )}
          {user && !user.is_premium && (user.pdf_downloads_count ?? 0) < freePdfLimit && (
            <p className="text-[10px] text-white/70 text-center mt-2">
              {freePdfLimit - (user.pdf_downloads_count ?? 0)} PDF
              {freePdfLimit - (user.pdf_downloads_count ?? 0) === 1 ? "" : "s"} gratuito
              {freePdfLimit - (user.pdf_downloads_count ?? 0) === 1 ? "" : "s"} restante
              {freePdfLimit - (user.pdf_downloads_count ?? 0) === 1 ? "" : "s"}
            </p>
          )}
          {user?.is_premium && (
            <p className="text-[10px] text-white/80 text-center mt-2 font-medium">
              Kit Consulta Premium ativo · PDFs ilimitados
            </p>
          )}
        </Card>

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
                {inTarget} de {exportMarkings.length} medições no modelo selecionado.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Gráfico de evolução</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
          ) : (
            <GlucoseChart data={allMarkings} />
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Distribuição por período</h3>
          {["Jejum", "Após Café", "Após Almoço", "Após Jantar"].map((period) => {
            const items = allMarkings.filter((m) => m.period === period);
            const avg = calcAverage(items.map((m) => m.value));
            const status = avg > 0 ? getGlucoseStatus(avg, period as Medicao["period"], targets) : null;
            return (
              <div key={period} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{period}</span>
                <div className="flex items-center gap-2">
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
