"use client";

import { cn } from "@/lib/utils";
import type { PdfTemplate } from "@/lib/premium";
import { PDF_TEMPLATES } from "@/lib/premium";

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
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Modelo do PDF
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PDF_TEMPLATES.map((tpl) => {
          const locked = tpl.premium && !isPremium;
          const selected = value === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                if (locked) {
                  onNeedPremium?.();
                  return;
                }
                onChange(tpl.id);
              }}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-all",
                selected
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 bg-white hover:border-brand-200",
                locked && "opacity-70"
              )}
            >
              <p className="text-sm font-semibold text-gray-900">{tpl.label}</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{tpl.description}</p>
              {locked && (
                <p className="text-[10px] font-semibold text-brand-600 mt-1.5">Premium</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
