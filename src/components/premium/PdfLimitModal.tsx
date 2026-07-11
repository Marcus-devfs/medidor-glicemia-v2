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
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { cpfDigits, formatCpfInput, isValidCpfInput } from "@/lib/cpf";
import { useAuth } from "@/contexts/AuthContext";
import {
  formatPremiumPrice,
  FREE_PDF_LIMIT,
  PREMIUM_ONE_TIME_NOTE,
} from "@/lib/premium";

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
  const [cpf, setCpf] = useState("");
  const [needsCpf, setNeedsCpf] = useState(true);
  const [pix, setPix] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoLoadRef = useRef(false);

  const reset = useCallback(() => {
    setStep("choose");
    setError("");
    setCpf("");
    setNeedsCpf(true);
    setPix(null);
    setCopied(false);
    setCheckingPayment(false);
    autoLoadRef.current = false;
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

  const loadPix = useCallback(
    async (cpfValue?: string) => {
      setLoading(true);
      setError("");
      try {
        const body = cpfValue ? { cpf: cpfDigits(cpfValue) } : {};
        const { data } = await api.post<PixData & { alreadyPaid?: boolean; is_premium?: boolean }>(
          "/payments/pix",
          body
        );

        if (data.alreadyPaid || data.is_premium) {
          await handlePremiumActivated();
          return;
        }

        setPix(data);
        setNeedsCpf(false);
        startPolling();
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { msg?: string; code?: string } } };
        const code = axiosErr.response?.data?.code;
        const msg = axiosErr.response?.data?.msg || "Erro ao gerar Pix. Tente novamente.";
        if (code === "NEED_CPF") {
          setNeedsCpf(true);
          setPix(null);
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [handlePremiumActivated, startPolling]
  );

  useEffect(() => {
    if (!open || step !== "pix" || pix || loading || autoLoadRef.current) return;
    autoLoadRef.current = true;
    loadPix();
  }, [open, step, pix, loading, loadPix]);

  const handlePixClick = () => {
    setError("");
    setPix(null);
    setNeedsCpf(true);
    autoLoadRef.current = false;
    setStep("pix");
  };

  const submitPixCheckout = () => {
    if (!isValidCpfInput(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }
    loadPix(cpf);
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
      title={step === "pix" ? "Pagamento Pix" : "Limite de PDFs atingido"}
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
              Você usou seus <strong>{FREE_PDF_LIMIT} PDFs gratuitos</strong>. Para desbloquear
              relatórios <strong>ilimitados</strong>, faça um pagamento único de{" "}
              <strong>{formatPremiumPrice()}</strong>.
            </p>

            <p className="text-[11px] text-brand-700 text-center leading-relaxed bg-brand-50 rounded-lg px-3 py-2">
              {PREMIUM_ONE_TIME_NOTE}
            </p>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <Button fullWidth onClick={handlePixClick} disabled={loading}>
              <QrCode className="h-4 w-4" />
              Pagar com Pix
            </Button>

            <Button
              fullWidth
              variant="secondary"
              onClick={goToCardCheckout}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pagar com cartão (página Asaas)
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
          </>
        )}

        {step === "pix" && (
          <>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total · pagamento único</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPremiumPrice()}</p>
              <p className="text-[10px] text-gray-500 mt-1">{PREMIUM_ONE_TIME_NOTE}</p>
            </div>

            {needsCpf && !pix && (
              <>
                <p className="text-sm text-gray-600 leading-relaxed text-center">
                  Informe seu CPF para emitir o Pix. Exigência do banco — não usamos no cadastro do
                  app.
                </p>

                <Input
                  id="pix-cpf"
                  label="CPF do pagador"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatCpfInput(e.target.value));
                    setError("");
                  }}
                />

                {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                <Button fullWidth onClick={submitPixCheckout} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      Gerar QR Code Pix
                    </>
                  )}
                </Button>
              </>
            )}

            {loading && !pix && !needsCpf && (
              <div className="flex flex-col items-center gap-2 py-6 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                <p className="text-sm">Carregando pagamento...</p>
              </div>
            )}

            {pix && (
              <>
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
                  Escaneie o QR ou copie o código. Após a confirmação, seus PDFs ficam ilimitados
                  para sempre — sem cobranças futuras.
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
              </>
            )}

            {error && pix && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="button"
              onClick={() => {
                if (pollRef.current) {
                  clearInterval(pollRef.current);
                  pollRef.current = null;
                }
                setError("");
                setPix(null);
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
