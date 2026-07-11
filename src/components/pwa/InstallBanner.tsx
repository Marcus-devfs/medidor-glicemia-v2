"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
  installReady?: boolean;
}

export function InstallBanner({ onInstall, onDismiss, installReady = true }: InstallBannerProps) {
  return (
    <div className="fixed top-0 inset-x-0 z-40 safe-top">
      <div className="mx-auto max-w-lg px-3 pt-3">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 shadow-lg text-white">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">
              Instalar o GestaGlic no seu celular
            </p>
            <p className="text-xs text-white/80 mt-0.5">
              {installReady ? "Grátis · Toque em Instalar" : "Preparando instalação..."}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onInstall}
            disabled={!installReady}
            className="shrink-0 bg-white text-brand-600 hover:bg-brand-50 border-0 disabled:opacity-60"
          >
            Instalar
          </Button>
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-full p-1.5 hover:bg-white/20 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
