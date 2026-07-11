"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut, User as UserIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  getReminderConfig,
  saveReminderConfig,
  DEFAULT_REMINDERS,
} from "@/lib/notifications";
import {
  enablePushNotifications,
  unsubscribeFromPush,
  syncRemindersToServer,
  fetchRemindersFromServer,
} from "@/lib/push/client";
import type { ReminderConfig } from "@/types";

export default function PerfilPage() {
  const { user, logout, toast, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reminders, setReminders] = useState<ReminderConfig>(DEFAULT_REMINDERS);
  const [saving, setSaving] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setName(user?.name ?? "");
      if (!user?._id) return;

      const fromServer = await fetchRemindersFromServer(user._id);
      if (fromServer) {
        setReminders(fromServer);
        saveReminderConfig(fromServer);
      } else {
        setReminders(getReminderConfig());
      }
    }
    load();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?._id) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/user/update/${user._id}`, { name });
      updateUser({ ...user, ...data });
      toast("Perfil atualizado!", "success");
    } catch {
      toast("Erro ao atualizar perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?._id) return;
    if (password.length < 4) {
      toast("Senha deve ter no mínimo 4 caracteres", "error");
      return;
    }
    if (password !== confirmPassword) {
      toast("Senhas não coincidem", "error");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/user/update/password/${user._id}`, { password });
      toast("Senha alterada!", "success");
      setPassword("");
      setConfirmPassword("");
    } catch {
      toast("Erro ao alterar senha", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleReminders = async () => {
    if (!user?._id) return;
    setPushLoading(true);

    try {
      if (!reminders.enabled) {
        const result = await enablePushNotifications(user._id);
        if (!result.success) {
          const messages = {
            denied: "Permissão de notificação negada",
            unsupported: "Seu navegador não suporta notificações push",
            no_vapid: "Push não configurado no servidor",
            dismissed: "Permissão não concedida",
            api_error: "Erro ao ativar notificações",
          };
          toast(messages[result.reason] ?? "Erro ao ativar", "error");
          return;
        }
        const updated = { ...reminders, enabled: true };
        setReminders(updated);
        saveReminderConfig(updated);
        toast("Lembretes ativados! Você receberá nos horários configurados.", "success");
      } else {
        await unsubscribeFromPush();
        const updated = { ...reminders, enabled: false };
        setReminders(updated);
        saveReminderConfig(updated);
        await syncRemindersToServer(user._id, updated);
        toast("Lembretes desativados", "success");
      }
    } finally {
      setPushLoading(false);
    }
  };

  const updateReminderTime = async (id: string, time: string) => {
    const updated = {
      ...reminders,
      reminders: reminders.reminders.map((r) => (r.id === id ? { ...r, time } : r)),
    };
    setReminders(updated);
    saveReminderConfig(updated);
    if (user?._id && reminders.enabled) {
      await syncRemindersToServer(user._id, updated);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Header title="Perfil" subtitle={user?.email} />

      <main className="flex flex-col gap-5 px-4 pb-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-gray-900">{user?.name}</p>
              {user?.is_premium && <PremiumBadge />}
            </div>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.is_premium && (
              <p className="text-xs text-amber-800/80 mt-1.5 leading-relaxed">
                Relatórios PDF ilimitados · pagamento único ativo
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Dados pessoais</h3>
          <div className="flex flex-col gap-3">
            <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={handleSaveProfile} disabled={saving} fullWidth>
              Salvar nome
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Alterar senha</h3>
          <div className="flex flex-col gap-3">
            <Input
              label="Nova senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button onClick={handleChangePassword} disabled={saving} variant="secondary" fullWidth>
              Alterar senha
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-600" />
              <h3 className="font-semibold text-gray-900">Lembretes</h3>
            </div>
            <Toggle
              checked={reminders.enabled}
              onChange={toggleReminders}
              label="Ativar lembretes"
            />
          </div>

          {pushLoading && (
            <p className="text-sm text-gray-400 mb-3">Configurando notificações...</p>
          )}

          {reminders.enabled && (
            <div className="flex flex-col gap-3">
              {reminders.reminders.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.period}</p>
                    <p className="text-xs text-gray-400 truncate">{r.label}</p>
                  </div>
                  <input
                    type="time"
                    value={r.time}
                    onChange={(e) => updateReminderTime(r.id, e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
                  />
                </div>
              ))}
              <p className="text-xs text-gray-400 leading-relaxed">
                Instale o app na tela inicial e mantenha as notificações ativas. Os lembretes chegam mesmo com o app fechado.
              </p>
            </div>
          )}
        </Card>

        <Button variant="danger" fullWidth onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </main>
    </div>
  );
}
