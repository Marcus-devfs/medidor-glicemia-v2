"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, Loader2, Share2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface ShareReportCardProps {
  onNeedPremium?: () => void;
}

export function ShareReportCard({ onNeedPremium }: ShareReportCardProps) {
  const { user, toast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const generateLink = useCallback(async () => {
    if (!user?.is_premium) {
      onNeedPremium?.();
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{ shareUrl: string; expiresAt: string }>("/reports/share");
      setShareUrl(data.shareUrl);
      setExpiresAt(data.expiresAt);
      toast("Link gerado! Válido por 7 dias.", "success");
    } catch {
      toast("Erro ao gerar link", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.is_premium, onNeedPremium, toast]);

  useEffect(() => {
    setShareUrl(null);
    setExpiresAt(null);
  }, [user?._id]);

  if (!user) return null;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Share2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">Link para sua médica</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Gere um link read-only com os últimos 14 dias. Expira em 7 dias — ideal para enviar antes
            da consulta.
          </p>
        </div>
      </div>

      {shareUrl ? (
        <div className="mt-4 flex flex-col gap-2">
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-700 break-all">
            {shareUrl}
          </div>
          {expiresAt && (
            <p className="text-[10px] text-gray-400">
              Expira em {new Date(expiresAt).toLocaleDateString("pt-BR")}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
                toast("Link copiado!", "success");
              }}
            >
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button fullWidth onClick={generateLink} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Novo link
            </Button>
          </div>
        </div>
      ) : (
        <Button className="mt-4" fullWidth onClick={generateLink} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              {user.is_premium ? "Gerar link compartilhável" : "Desbloquear com Premium"}
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
