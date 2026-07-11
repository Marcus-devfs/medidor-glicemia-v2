"use client";

import { Share, Plus } from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { APP_ICON } from "@/lib/brand";

interface IosInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export function IosInstallModal({ open, onClose }: IosInstallModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Instalar no iPhone">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
          <Image src={APP_ICON} alt="GestaGlic" width={48} height={48} className="rounded-xl" />
          <div>
            <p className="font-bold text-gray-900">GestaGlic</p>
            <p className="text-xs text-gray-500">app.gestaglic.com.br</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed text-center">
          Só <strong>2 toques</strong> no Safari — sem menu complicado:
        </p>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border-2 border-brand-200 bg-white p-4">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">
              Passo 1 — Toque aqui embaixo
            </p>
            <div className="flex flex-col items-center gap-2 rounded-xl bg-gray-50 py-5 border border-dashed border-gray-200">
              <Share className="h-9 w-9 text-blue-500" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-gray-700">Compartilhar</span>
              <span className="text-[10px] text-gray-400">Barra inferior do Safari ↑</span>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-brand-200 bg-white p-4">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">
              Passo 2 — Toque nesta opção
            </p>
            <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white">
                <Plus className="h-6 w-6 text-gray-800" strokeWidth={1.5} />
                <span className="text-base font-medium text-gray-900">Adicionar à Tela de Início</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Depois confirme em &ldquo;Adicionar&rdquo; — pronto! 🎉
            </p>
          </div>
        </div>

        <Button fullWidth onClick={onClose}>
          Entendi, vou instalar!
        </Button>
      </div>
    </Modal>
  );
}
