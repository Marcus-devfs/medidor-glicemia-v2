"use client";

import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useReminders } from "@/hooks/useReminders";

const BENEFITS = [
  "Lembrete nos horários de jejum e pós-refeição",
  "Não envia se você já registrou a medição do dia",
  "No máximo 1 aviso por horário — sem spam",
];

export function RemindersCard() {
  const { user, toast } = useAuth();
  const { reminders, loading, pushLoading, toggleReminders } = useReminders(user?._id);

  const handleToggle = () => {
    toggleReminders(
      (msg) => toast(msg, "error"),
      (msg) => toast(msg, "success")
    );
  };

  if (loading) {
    return (
      <Card className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-brand-600 shrink-0" />
        <p className="text-sm text-gray-400">Carregando lembretes...</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Bell className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">
              {reminders.enabled ? "Lembretes ativos" : "Ative os lembretes de medição"}
            </p>
            <Toggle
              checked={reminders.enabled}
              onChange={handleToggle}
              label={reminders.enabled ? "Desativar lembretes" : "Ativar lembretes"}
            />
          </div>

          {reminders.enabled ? (
            <>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                Você receberá avisos nos horários configurados para medir a glicemia.
              </p>
              <Link
                href="/perfil"
                className="inline-block text-xs text-brand-600 font-medium mt-2 hover:underline"
              >
                Ajustar horários no Perfil →
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Mantenha a rotina de medições com lembretes discretos — só o essencial para você
                e o bebê.
              </p>
              <ul className="mt-2.5 space-y-1">
                {BENEFITS.map((item) => (
                  <li key={item} className="text-[11px] text-gray-600 leading-snug flex gap-1.5">
                    <span className="text-brand-500 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {pushLoading && (
        <p className="text-[11px] text-gray-400 pl-8">Configurando notificações...</p>
      )}
    </Card>
  );
}
