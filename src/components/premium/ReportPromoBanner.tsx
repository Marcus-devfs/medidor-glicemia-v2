"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DISMISS_KEY = "gestaglic_report_promo_dismissed";

export function ReportPromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative rounded-2xl border border-brand-200 bg-brand-50 p-4 pr-10">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-white/80 hover:text-gray-600"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 shrink-0 text-brand-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Leve um relatório na consulta pré-natal
          </p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Gere um PDF com suas medições, médias e evolução — sua obstetra vai adorar ver tudo
            organizado.
          </p>
          <Link href="/relatorio" className="mt-3 block">
            <Button size="sm" fullWidth>
              Gerar relatório para consulta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
