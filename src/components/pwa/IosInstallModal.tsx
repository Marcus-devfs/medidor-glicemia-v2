"use client";

import { Share, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface IosInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export function IosInstallModal({ open, onClose }: IosInstallModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Instalar no iPhone">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          Para usar o GestaGlic como aplicativo no seu iPhone, siga estes passos:
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 font-bold text-lg">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Toque no botão Compartilhar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                O ícone fica na barra inferior do Safari
              </p>
              <div className="mt-3 flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-4">
                <div className="flex flex-col items-center gap-1">
                  <Share className="h-7 w-7 text-blue-500" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium text-gray-500">Compartilhar</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 font-bold text-lg">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Role para baixo e toque em &ldquo;Adicionar à Tela de Início&rdquo;
              </p>
              <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">GestaGlic</p>
                    <p className="text-xs text-gray-400">gestaglic.app</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Plus className="h-5 w-5 text-gray-700" strokeWidth={1.5} />
                  <span className="text-sm text-gray-800">Adicionar à Tela de Início</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 font-bold text-lg">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Toque em &ldquo;Adicionar&rdquo; no canto superior direito
              </p>
              <p className="text-xs text-gray-500 mt-1">
                O ícone do GestaGlic aparecerá na sua tela inicial 🎉
              </p>
            </div>
          </div>
        </div>

        <Button fullWidth onClick={onClose}>
          Entendi!
        </Button>
      </div>
    </Modal>
  );
}
