"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SummaryCard } from "@/components/charts/SummaryCard";
import { GlucoseChart } from "@/components/charts/GlucoseChartLazy";
import { PdfLimitModal } from "@/components/premium/PdfLimitModal";
import { PremiumReturnHandler } from "@/components/premium/PremiumReturnHandler";
import { useAuth } from "@/contexts/AuthContext";
import { usePdfExport } from "@/hooks/usePdfExport";
import { api } from "@/lib/api";
import { calcAverage, getGlucoseStatus, getStatusColor, getStatusLabel } from "@/lib/glucose";
import { formatPremiumPrice, FREE_PDF_LIMIT, PREMIUM_ONE_TIME_NOTE } from "@/lib/premium";
import { TARGET_INFO, cn } from "@/lib/utils";
import { useRegisterPageRefresh } from "@/contexts/RefreshContext";
import type { Medicao } from "@/types";

const years = [
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "Todos", value: "todos" },
];

export default function RelatorioPage() {
  const { user } = useAuth();
  const { exportPdf, exporting, showLimitModal, setShowLimitModal } = usePdfExport();
  const [year, setYear] = useState("todos");
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

  const inTarget = allMarkings.filter(
    (m) => getGlucoseStatus(m.value, m.period) === "normal"
  ).length;
  const pct = allMarkings.length ? Math.round((inTarget / allMarkings.length) * 100) : 0;

  const handleExportPdf = () => {
    exportPdf(allMarkings, {
      year,
      stats: {
        jejumAvg: medias.jejum,
        aposAvg: medias.apos,
        inTargetPct: pct,
        total: allMarkings.length,
      },
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <Suspense fallback={null}>
        <PremiumReturnHandler />
      </Suspense>
      <Header title="Relatório" subtitle="Acompanhe sua evolução" />

      <main className="flex flex-col gap-5 px-4 pb-4">
        <Card className="bg-gradient-to-br from-brand-600 to-brand-500 text-white border-0">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base">Relatório para consulta</h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Exporte um PDF profissional com logo GestaGlic, resumo e tabela por data e período
                — pronto para levar à médica.
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportPdf}
            disabled={exporting || loading || allMarkings.length === 0}
            fullWidth
            className="mt-4 bg-white text-brand-600 hover:bg-brand-50 border-0"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Gerando PDF..." : "Baixar relatório PDF"}
          </Button>
          {user && !user.is_premium && (user.pdf_downloads_count ?? 0) >= FREE_PDF_LIMIT && (
            <p className="text-[10px] text-white/90 text-center mt-2 leading-relaxed">
              Limite gratuito atingido · desbloqueie ilimitado com pagamento único de{" "}
              {formatPremiumPrice()}. {PREMIUM_ONE_TIME_NOTE}
            </p>
          )}
          {user && !user.is_premium && (user.pdf_downloads_count ?? 0) < FREE_PDF_LIMIT && (
            <p className="text-[10px] text-white/70 text-center mt-2">
              {FREE_PDF_LIMIT - (user.pdf_downloads_count ?? 0)} PDF
              {FREE_PDF_LIMIT - (user.pdf_downloads_count ?? 0) === 1 ? "" : "s"} gratuito
              {FREE_PDF_LIMIT - (user.pdf_downloads_count ?? 0) === 1 ? "" : "s"} restante
              {FREE_PDF_LIMIT - (user.pdf_downloads_count ?? 0) === 1 ? "" : "s"}
            </p>
          )}
          {user?.is_premium && (
            <p className="text-[10px] text-white/80 text-center mt-2 font-medium">
              Premium · PDFs ilimitados
            </p>
          )}
        </Card>

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
                {inTarget} de {allMarkings.length} medições dentro dos valores recomendados para gestantes.
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
            const status = avg > 0 ? getGlucoseStatus(avg, period as Medicao["period"]) : null;
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

        <p className="text-xs text-center text-gray-400 px-2 leading-relaxed">{TARGET_INFO}</p>
      </main>

      <PdfLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}
