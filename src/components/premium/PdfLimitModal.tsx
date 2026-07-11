"use client";

import { useState } from "react";
import { ExternalLink, Heart, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export const FREE_PDF_LIMIT = 5;
export const PREMIUM_PRICE = 9.9;

interface PdfLimitModalProps {
  open: boolean;
  onClose: () => void;
}

export function PdfLimitModal({ open, onClose }: PdfLimitModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<{ checkoutUrl: string }>("/payments/checkout");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setError("Não foi possível abrir o pagamento. Tente novamente.");
    } catch {
      setError("Erro ao iniciar pagamento. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Limite de PDFs atingido">
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <Heart className="h-8 w-8 text-brand-600" />
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed text-center">
          Você já utilizou seus <strong>{FREE_PDF_LIMIT} PDFs gratuitos</strong>! 🥳 Esperamos que
          tenham ajudado na sua consulta médica.
        </p>

        <p className="text-sm text-gray-600 leading-relaxed text-center">
          Para continuar gerando relatórios <strong>ilimitados</strong> até o nascimento do bebê,
          faça o pagamento único de{" "}
          <strong>R$ {PREMIUM_PRICE.toFixed(2).replace(".", ",")}</strong> via Pix ou cartão de
          crédito no checkout seguro Asaas.
        </p>

        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Pix ou cartão de crédito</p>
          <p className="text-lg font-bold text-brand-700">
            R$ {PREMIUM_PRICE.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Após confirmar o pagamento, seu premium é liberado automaticamente.
          </p>
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <Button fullWidth onClick={goToCheckout} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Abrindo checkout...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              Pagar e liberar PDFs ilimitados
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-400 text-center hover:text-gray-600"
        >
          Agora não
        </button>
      </div>
    </Modal>
  );
}
