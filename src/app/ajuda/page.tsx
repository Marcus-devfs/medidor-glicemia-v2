"use client";

import { useState } from "react";
import { HelpCircle, MessageSquare, Bug, Send, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { api } from "@/lib/api";
import { LP_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    id: "help" as const,
    label: "Preciso de ajuda",
    description: "Dúvidas sobre como usar o app",
    icon: HelpCircle,
  },
  {
    id: "feedback" as const,
    label: "Sugestão ou elogio",
    description: "Ideias para melhorar o GestaGlic",
    icon: MessageSquare,
  },
  {
    id: "bug" as const,
    label: "Reportar problema",
    description: "Algo não funcionou como esperado",
    icon: Bug,
  },
];

export default function AjudaPage() {
  const { toast } = useAuth();
  const { openOnboarding } = useOnboarding();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("help");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (trimmed.length < 5) {
      toast("Escreva pelo menos 5 caracteres", "error");
      return;
    }

    setSending(true);
    try {
      await api.post("/feedback", { category, message: trimmed });
      setSent(true);
      setMessage("");
      toast("Mensagem enviada! Obrigada pelo contato.", "success");
    } catch {
      toast("Não foi possível enviar. Tente de novo.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Header
        title="Ajuda & feedback"
        subtitle="Estamos aqui para ouvir você"
      />

      <main className="flex flex-col gap-5 px-4 pb-6">
        <Card>
          <p className="text-sm text-gray-600 leading-relaxed">
            Conte o que precisa, sugira melhorias ou avise se algo deu errado. Lemos todas as
            mensagens — em geral respondemos em até 1–2 dias úteis.
          </p>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Tour do app</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Reveja os passos: início, lembretes, medição, relatório e mais.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={openOnboarding} className="shrink-0">
            Ver tour
          </Button>
        </Card>

        {sent && (
          <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
            Recebemos sua mensagem. Obrigada por ajudar a melhorar o GestaGlic!
          </div>
        )}

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Tipo de mensagem</h3>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                  category === id
                    ? "border-brand-300 bg-brand-50"
                    : "border-gray-100 hover:bg-gray-50"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 mt-0.5",
                    category === id ? "text-brand-600" : "text-gray-400"
                  )}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <label htmlFor="feedback-message" className="font-semibold text-gray-900 block mb-2">
            Sua mensagem
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Descreva sua dúvida, sugestão ou o que aconteceu..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/2000</p>
          <Button
            onClick={handleSubmit}
            disabled={sending || message.trim().length < 5}
            fullWidth
            className="mt-3"
          >
            <Send className="h-4 w-4" />
            {sending ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </Card>

        <Card className="bg-gray-50 border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Dicas rápidas</h3>
          <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
            <li>
              Para instalar no iPhone: Safari → Compartilhar → Adicionar à Tela de Início.
            </li>
            <li>
              Lembretes só funcionam com o app instalado e notificações permitidas.
            </li>
            <li>
              Artigos sobre gestação e glicemia em{" "}
              <a href={`${LP_URL}/dicas`} className="text-brand-600 font-medium">
                gestaglic.com.br/dicas
              </a>
              .
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
