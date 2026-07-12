"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePremiumSettings } from "@/contexts/PremiumSettingsContext";
import { PREMIUM_ONE_TIME_NOTE } from "@/lib/premium";

const DISMISS_KEY = "gestaglic_premium_limit_banner_dismissed";

export function PremiumLimitBanner() {
  const { freePdfLimit, formatPremiumPrice } = usePremiumSettings();
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
    <div className="relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 pr-10">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-white/80 hover:text-gray-600"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Você usou seus {freePdfLimit} PDFs gratuitos
          </p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Desbloqueie o Kit Consulta Premium — PDFs profissionais, link para médica, resumo
            semanal e metas personalizadas por{" "}
            <strong className="text-gray-900">{formatPremiumPrice()}</strong>.
          </p>
          <p className="text-[10px] text-amber-800/80 mt-1.5">{PREMIUM_ONE_TIME_NOTE}</p>
          <Link href="/relatorio" className="mt-3 block">
            <Button size="sm" fullWidth>
              Ver Kit Consulta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
