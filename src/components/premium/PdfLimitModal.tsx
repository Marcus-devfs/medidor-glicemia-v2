"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  CreditCard,
  ExternalLink,
  Heart,
  Loader2,
  Check,
  QrCode,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export const FREE_PDF_LIMIT = 5;
export const PREMIUM_PRICE = 9.9;

interface PdfLimitModalProps {
  open: boolean;
  onClose: () => void;
}

interface PixData {
  paymentId: string;
  encodedImage: string;
  payload: string;
  expirationDate?: string;
  amount: number;
  sandbox?: boolean;
}

type Step = "choose" | "pix";

export function PdfLimitModal({ open, onClose }: PdfLimitModalProps) {
  const { user, updateUser, toast } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pix, setPix] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setStep("choose");
    setError("");
    setPix(null);
    setCopied(false);
    setCheckingPayment(false);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handlePremiumActivated = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await api.get<{
        is_premium: boolean;
        pdf_downloads_count?: number;
      }>(`/user/${user._id}`);
      updateUser({ ...user, is_premium: true, pdf_downloads_count: data.pdf_downloads_count });
      toast("Pagamento confirmado! PDFs ilimitados liberados 💗", "success");
      onClose();
    } catch {
      updateUser({ ...user, is_premium: true });
      toast("Premium liberado! 💗", "success");
      onClose();
    }
  }, [user, updateUser, toast, onClose]);

  const checkPremiumStatus = useCallback(async () => {
    try {
      const { data } = await api.get<{ is_premium: boolean }>("/payments/premium-status");
      if (data.is_premium) {
        await handlePremiumActivated();
        return true;
      }
    } catch {
      // ignore poll errors
    }
    return false;
  }, [handlePremiumActivated]);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      await checkPremiumStatus();
    }, 4000);
  }, [checkPremiumStatus]);

  const loadPix = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<PixData & { alreadyPaid?: boolean; is_premium?: boolean }>(
        "/payments/pix"
      );

      if (data.alreadyPaid || data.is_premium) {
        await handlePremiumActivated();
        return;
      }

      setPix(data);
      setStep("pix");
      startPolling();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      setError(axiosErr.response?.data?.msg || "Erro ao gerar Pix. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const goToCardCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<{ checkoutUrl: string }>("/payments/card-checkout");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setError("Não foi possível abrir o pagamento.");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      setError(axiosErr.response?.data?.msg || "Erro ao abrir checkout do cartão.");
    } finally {
      setLoading(false);
    }
  };

  const copyPayload = async () => {
    if (!pix?.payload) return;
    try {
      await navigator.clipboard.writeText(pix.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copie o código manualmente", "info");
    }
  };

  const manualCheck = async () => {
    setCheckingPayment(true);
    const paid = await checkPremiumStatus();
    if (!paid) toast("Pagamento ainda não confirmado. Aguarde alguns segundos.", "info");
    setCheckingPayment(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === "pix" ? "Pague com Pix" : "Limite de PDFs atingido"}
    >
      <div className="flex flex-col gap-4">
        {step === "choose" && (
          <>
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
                <Heart className="h-7 w-7 text-brand-600" />
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed text-center">
              Você usou seus <strong>{FREE_PDF_LIMIT} PDFs gratuitos</strong>. Desbloqueie relatórios{" "}
              <strong>ilimitados</strong> por{" "}
              <strong>R$ {PREMIUM_PRICE.toFixed(2).replace(".", ",")}</strong>.
            </p>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <Button fullWidth onClick={loadPix} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Pagar com Pix
                </>
              )}
            </Button>

            <Button
              fullWidth
              variant="secondary"
              onClick={goToCardCheckout}
              disabled={loading}
            >
              <CreditCard className="h-4 w-4" />
              Pagar com cartão (página Asaas)
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-400 text-center hover:text-gray-600"
            >
              Agora não
            </button>
          </>
        )}

        {step === "pix" && pix && (
          <>
            <p className="text-center text-sm font-semibold text-gray-900">
              R$ {PREMIUM_PRICE.toFixed(2).replace(".", ",")}
            </p>

            {pix.sandbox && (
              <p className="text-[10px] text-amber-600 text-center bg-amber-50 rounded-lg px-2 py-1">
                Modo sandbox — confirme o pagamento no painel Asaas para testar
              </p>
            )}

            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${pix.encodedImage}`}
                alt="QR Code Pix"
                className="w-48 h-48 rounded-xl border border-gray-100"
              />
            </div>

            <button
              type="button"
              onClick={copyPayload}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-brand-200 bg-brand-50 py-3 text-sm font-medium text-brand-700"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copiar código Pix
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Escaneie o QR ou copie o código. O premium libera automaticamente após a
              confirmação.
            </p>

            <Button
              fullWidth
              variant="secondary"
              size="sm"
              onClick={manualCheck}
              disabled={checkingPayment}
            >
              {checkingPayment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Já paguei — verificar agora"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                reset();
                setStep("choose");
              }}
              className="text-xs text-gray-400 text-center hover:text-gray-600"
            >
              ← Voltar
            </button>

            <button
              type="button"
              onClick={goToCardCheckout}
              className="flex items-center justify-center gap-1 text-xs text-brand-600"
            >
              <ExternalLink className="h-3 w-3" />
              Prefere cartão? Abrir checkout Asaas
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
