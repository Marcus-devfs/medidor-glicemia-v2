"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  PlusCircle,
  Users,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LP_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  userName?: string;
}

const STEPS = [
  {
    icon: Home,
    color: "bg-brand-100 text-brand-600",
    title: "Seu painel na Início",
    description:
      "A tela inicial mostra o resumo das suas medições: médias de jejum e pós-refeição, gráfico recente e atalhos. É o seu dashboard do dia a dia.",
    href: "/",
    linkLabel: "Ver início",
  },
  {
    icon: Bell,
    color: "bg-amber-100 text-amber-700",
    title: "Ative os lembretes",
    description:
      "No Perfil, ligue as notificações e escolha os horários de cada medição. Assim você não esquece de registrar — e só avisamos se ainda não mediu naquele dia.",
    href: "/perfil",
    linkLabel: "Ir ao perfil",
  },
  {
    icon: PlusCircle,
    color: "bg-green-100 text-green-700",
    title: "Registre uma medição",
    description:
      "Toque em Medir na barra inferior, informe glicemia, horário e se estava em jejum ou após refeição. Quanto antes começar, melhor o histórico na consulta.",
    href: "/medicao",
    linkLabel: "Fazer medição",
  },
  {
    icon: BarChart3,
    color: "bg-violet-100 text-violet-700",
    title: "Relatório para a obstetra",
    description:
      "Em Relatório você vê gráficos, resumos por período e pode emitir um PDF personalizado para levar na consulta — organizado e profissional.",
    href: "/relatorio",
    linkLabel: "Ver relatório",
  },
  {
    icon: Users,
    color: "bg-pink-100 text-pink-600",
    title: "Comunidade de gestantes",
    description:
      "No menu (canto superior) acesse a Comunidade: troque experiências, dúvidas e vitórias com outras mamães que vivem diabetes gestacional.",
    href: "/comunidade",
    linkLabel: "Ver comunidade",
  },
  {
    icon: BookOpen,
    color: "bg-sky-100 text-sky-700",
    title: "Dicas para você",
    description:
      "Artigos sobre alimentação, ansiedade e cuidados na gestação — também no menu lateral. Conteúdo pensado para o seu momento.",
    href: `${LP_URL}/dicas`,
    linkLabel: "Ler dicas",
    external: true,
  },
] as const;

export function OnboardingModal({ open, onComplete, userName }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const firstName = userName?.trim().split(/\s+/)[0] || "mamãe";
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const handleClose = () => {
    setStep(0);
    onComplete();
  };

  const goNext = () => {
    if (isLast) handleClose();
    else setStep((s) => s + 1);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 0 ? `Bem-vinda, ${firstName}! 💗` : "Como usar o GestaGlic"}
    >
      <div className="flex flex-col gap-5">
        {step === 0 && (
          <p className="text-sm text-gray-600 leading-relaxed -mt-1">
            Em poucos passos você aprende o essencial. Leva menos de 1 minuto.
          </p>
        )}

        <div className="flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-brand-500" : "w-1.5 bg-gray-200"
              )}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                current.color
              )}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Passo {step + 1} de {STEPS.length}
              </p>
              <h3 className="mt-1 text-base font-bold text-gray-900">{current.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{current.description}</p>
            </div>
          </div>
        </div>

        {"external" in current && current.external ? (
          <a
            href={current.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {current.linkLabel} →
          </a>
        ) : (
          <Link
            href={current.href}
            className="text-center text-sm font-semibold text-brand-600 hover:text-brand-700"
            onClick={handleClose}
          >
            {current.linkLabel} →
          </Link>
        )}

        <div className="flex gap-2">
          {step > 0 && (
            <Button
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
              className="shrink-0 px-4"
              aria-label="Voltar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <Button fullWidth onClick={goNext}>
            {isLast ? (
              <>
                <Heart className="h-4 w-4 fill-current" />
                Começar a usar!
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {!isLast && (
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-gray-400 hover:text-gray-600 text-center"
          >
            Pular tour
          </button>
        )}
      </div>
    </Modal>
  );
}
