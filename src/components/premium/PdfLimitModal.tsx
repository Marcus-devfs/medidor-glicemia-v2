"use client";

import { Heart } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PdfLimitModalProps {
  open: boolean;
  onClose: () => void;
}

export function PdfLimitModal({ open, onClose }: PdfLimitModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Limite de PDFs atingido">
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <Heart className="h-8 w-8 text-brand-600" />
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed text-center">
          Você já utilizou seus <strong>2 PDFs gratuitos</strong>! 🥳 Esperamos que eles tenham
          ajudado na sua consulta médica.
        </p>

        <p className="text-sm text-gray-600 leading-relaxed text-center">
          Para continuar gerando relatórios ilimitados até o nascimento do seu bebê, faça um{" "}
          <strong>Pix único de apenas R$ 9,90</strong> e apoie o desenvolvimento do GestaGlic.
        </p>

        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Chave Pix</p>
          <p className="text-sm font-semibold text-brand-700 break-all">
            marcusvf.silva@outlook.com.br
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Após o pagamento, envie o comprovante pelo WhatsApp para liberarmos seu acesso premium.
          </p>
        </div>

        <Button fullWidth onClick={onClose}>
          Entendi
        </Button>
      </div>
    </Modal>
  );
}
