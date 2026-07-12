"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PdfTemplate } from "@/lib/premium";
import { PDF_TEMPLATES } from "@/lib/premium";

/** Ordem exibida: consulta curta → completo */
const TEMPLATE_ORDER: PdfTemplate[] = [
  "consulta7",
  "consulta14",
  "consulta30",
  "completo",
];

const SHORT_LABELS: Record<PdfTemplate, string> = {
  consulta7: "7 dias",
  consulta14: "14 dias",
  consulta30: "30 dias",
  completo: "Completo",
};

interface PdfTemplatePickerProps {
  value: PdfTemplate;
  onChange: (value: PdfTemplate) => void;
  isPremium: boolean;
  onNeedPremium?: () => void;
}

export function PdfTemplatePicker({
  value,
  onChange,
  isPremium,
  onNeedPremium,
}: PdfTemplatePickerProps) {
  const templates = TEMPLATE_ORDER.map(
    (id) => PDF_TEMPLATES.find((t) => t.id === id)!
  );
  const selected = templates.find((t) => t.id === value);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">Período do PDF</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Escolha quantos dias entram no relatório para a consulta
        </p>
      </div>

      <div
        className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-gray-100"
        role="tablist"
        aria-label="Período do relatório"
      >
        {templates.map((tpl) => {
          const locked = tpl.premium && !isPremium;
          const isSelected = value === tpl.id;

          return (
            <button
              key={tpl.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                if (locked) {
                  onNeedPremium?.();
                  return;
                }
                onChange(tpl.id);
              }}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl py-2.5 px-1 min-h-[52px] transition-all",
                "text-xs font-semibold leading-tight",
                isSelected && !locked
                  ? "bg-white text-brand-700 shadow-md ring-2 ring-brand-500"
                  : locked
                    ? "text-gray-400 hover:bg-gray-50"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
              )}
            >
              {isSelected && !locked && (
                <Check
                  className="absolute top-1 right-1 h-3 w-3 text-brand-600"
                  strokeWidth={3}
                  aria-hidden
                />
              )}
              {locked && (
                <Lock className="h-3 w-3 mb-0.5 text-gray-400" aria-hidden />
              )}
              <span>{SHORT_LABELS[tpl.id]}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-xl px-3 py-2.5 bg-brand-50 border border-brand-100">
          <p className="text-sm font-medium text-gray-900">{selected.label}</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{selected.description}</p>
          {selected.premium && !isPremium && (
            <p className="text-xs font-semibold text-brand-600 mt-1.5">
              Disponível no Kit Consulta Premium
            </p>
          )}
        </div>
      )}
    </div>
  );
}
