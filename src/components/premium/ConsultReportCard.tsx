"use client";

import { Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PdfTemplatePicker } from "@/components/premium/PdfTemplatePicker";
import { PREMIUM_ONE_TIME_NOTE, type PdfTemplate } from "@/lib/premium";
import { getTemplateLabel } from "@/lib/reportStats";
import type { User } from "@/types";

interface ConsultReportCardProps {
  user: User | null;
  pdfTemplate: PdfTemplate;
  onTemplateChange: (template: PdfTemplate) => void;
  onNeedPremium: () => void;
  exportCount: number;
  loading: boolean;
  exporting: boolean;
  onExport: () => void;
  freePdfLimit: number;
  formatPremiumPrice: () => string;
}

export function ConsultReportCard({
  user,
  pdfTemplate,
  onTemplateChange,
  onNeedPremium,
  exportCount,
  loading,
  exporting,
  onExport,
  freePdfLimit,
  formatPremiumPrice,
}: ConsultReportCardProps) {
  const pdfCount = user?.pdf_downloads_count ?? 0;
  const isPremium = !!user?.is_premium;
  const atLimit = !isPremium && pdfCount >= freePdfLimit;
  const remainingFree = freePdfLimit - pdfCount;

  return (
    <Card className="overflow-hidden border-brand-100 p-0 shadow-sm">
      <div className="bg-brand-600 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Relatório para consulta</h3>
            <p className="text-sm text-white/90 mt-1 leading-relaxed">
              PDF com DPP, semana gestacional e metas — pronto para a obstetra.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 bg-white">
        <PdfTemplatePicker
          value={pdfTemplate}
          onChange={onTemplateChange}
          isPremium={isPremium}
          onNeedPremium={onNeedPremium}
        />

        <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
          <span className="text-xs text-gray-500">No PDF selecionado</span>
          <span className="text-sm font-semibold text-gray-900">
            {loading ? "…" : exportCount}{" "}
            {exportCount === 1 ? "medição" : "medições"}
          </span>
        </div>

        <Button
          onClick={onExport}
          disabled={exporting || loading || exportCount === 0}
          fullWidth
          size="md"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Gerando PDF..." : `Baixar PDF · ${getTemplateLabel(pdfTemplate)}`}
        </Button>

        {exportCount === 0 && !loading && (
          <p className="text-xs text-amber-700 text-center bg-amber-50 rounded-lg py-2 px-3">
            Nenhuma medição neste período. Registre glicemia ou escolha outro intervalo.
          </p>
        )}

        {atLimit && (
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            Limite gratuito atingido · Kit Consulta{" "}
            <strong className="text-gray-900">{formatPremiumPrice()}</strong>
            <span className="block text-[11px] text-gray-400 mt-1">{PREMIUM_ONE_TIME_NOTE}</span>
          </p>
        )}

        {!isPremium && !atLimit && remainingFree > 0 && (
          <p className="text-xs text-gray-500 text-center">
            {remainingFree} PDF{remainingFree === 1 ? "" : "s"} gratuito
            {remainingFree === 1 ? "" : "s"} restante{remainingFree === 1 ? "" : "s"}
          </p>
        )}

        {isPremium && (
          <p className="text-xs text-brand-700 text-center font-medium bg-brand-50 rounded-lg py-2">
            Kit Consulta Premium · PDFs ilimitados
          </p>
        )}
      </div>
    </Card>
  );
}
