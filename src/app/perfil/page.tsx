"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Baby, Bell, Crown, LogOut, User as UserIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useRegisterPageRefresh } from "@/contexts/RefreshContext";
import { api } from "@/lib/api";
import { LEGAL_CONTACT_EMAIL, LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/lib/brand";
import { useReminders } from "@/hooks/useReminders";
import { babySexLabel, gestationSummary, momOfBabyLabel } from "@/lib/pregnancy";
import { PREMIUM_KIT_FEATURES } from "@/lib/premium";
import { DEFAULT_GLUCOSE_TARGETS } from "@/lib/premium";
import { toDateInputValue } from "@/lib/utils";
import type { BabySex, User } from "@/types";

export default function PerfilPage() {
  const { user, logout, toast, updateUser, refreshUser } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fetusCount, setFetusCount] = useState(1);
  const [babyName, setBabyName] = useState("");
  const [babySex, setBabySex] = useState<BabySex>("nao_informado");
  const [targetJejum, setTargetJejum] = useState<number>(DEFAULT_GLUCOSE_TARGETS.jejum);
  const [targetPos1h, setTargetPos1h] = useState<number>(DEFAULT_GLUCOSE_TARGETS.pos1h);
  const [targetPos2h, setTargetPos2h] = useState<number>(DEFAULT_GLUCOSE_TARGETS.pos2h);
  const [weeklyEmail, setWeeklyEmail] = useState(false);
  const { reminders, pushLoading, toggleReminders, updateReminderTime } = useReminders(user?._id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setDueDate(user.pregnancy?.dueDate ? toDateInputValue(user.pregnancy.dueDate) : "");
    setFetusCount(user.pregnancy?.fetusCount ?? 1);
    setBabyName(user.pregnancy?.babyName ?? "");
    setBabySex(user.pregnancy?.babySex ?? "nao_informado");
    setTargetJejum(user.glucoseTargets?.jejum ?? DEFAULT_GLUCOSE_TARGETS.jejum);
    setTargetPos1h(user.glucoseTargets?.pos1h ?? DEFAULT_GLUCOSE_TARGETS.pos1h);
    setTargetPos2h(user.glucoseTargets?.pos2h ?? DEFAULT_GLUCOSE_TARGETS.pos2h);
    setWeeklyEmail(!!user.preferences?.weeklySummaryEmail);
  }, [user]);

  useRegisterPageRefresh(refreshUser);

  const saveProfile = async (payload: Partial<User>) => {
    if (!user?._id) return;
    setSaving(true);
    try {
      const { data } = await api.patch<User>(`/user/update/${user._id}`, payload);
      updateUser({ ...user, ...data });
      toast("Salvo!", "success");
    } catch {
      toast("Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = () => saveProfile({ name });

  const handleSavePregnancy = () =>
    saveProfile({
      pregnancy: {
        dueDate: dueDate || null,
        fetusCount,
        babyName: babyName.trim() || null,
        babySex,
      },
    });

  const handleSaveTargets = () => {
    if (!user?.is_premium) {
      toast("Metas personalizadas são do Kit Consulta Premium", "info");
      return;
    }
    saveProfile({
      glucoseTargets: {
        jejum: targetJejum,
        pos1h: targetPos1h,
        pos2h: targetPos2h,
      },
    });
  };

  const handleToggleWeeklyEmail = async () => {
    if (!user?.is_premium) {
      toast("Resumo semanal por e-mail é do Kit Consulta Premium", "info");
      return;
    }
    const next = !weeklyEmail;
    setWeeklyEmail(next);
    await saveProfile({ preferences: { weeklySummaryEmail: next } });
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

  const handleToggleReminders = () => {
    toggleReminders(
      (msg) => toast(msg, "error"),
      (msg) => toast(msg, "success")
    );
  };

  const gestationLine = gestationSummary(dueDate || user?.pregnancy?.dueDate, fetusCount);
  const momLine = momOfBabyLabel({ babyName, babySex });

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
            {user?.is_premium ? (
              <p className="text-xs text-amber-800/80 mt-1.5 leading-relaxed">
                Kit Consulta Premium ativo · pagamento único
              </p>
            ) : (
              <Link
                href="/relatorio"
                className="text-xs text-brand-600 font-semibold mt-1.5 inline-block"
              >
                Conhecer o Kit Consulta →
              </Link>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Baby className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Dados da gestação</h3>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              label="Data prevista do parto (DPP)"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantidade de fetos
              </label>
              <select
                value={fetusCount}
                onChange={(e) => setFetusCount(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value={1}>1 — gestação única</option>
                <option value={2}>2 — gemelar</option>
                <option value={3}>3 ou mais</option>
              </select>
            </div>
            <Input
              label="Nome do bebê (opcional)"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder={fetusCount > 1 ? "Ex.: Sofia e Pedro" : "Ex.: Sofia"}
              maxLength={80}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sexo do bebê
              </label>
              <select
                value={babySex}
                onChange={(e) => setBabySex(e.target.value as BabySex)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="nao_informado">{babySexLabel("nao_informado")}</option>
                <option value="feminino">{babySexLabel("feminino")}</option>
                <option value="masculino">{babySexLabel("masculino")}</option>
              </select>
              <p className="mt-1.5 text-[11px] text-gray-400 leading-relaxed">
                Usamos isso só para personalizar saudação e lembretes — nada disso aparece no PDF da
                obstetra.
              </p>
            </div>
            {(gestationLine || momLine) && (
              <p className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2">
                {[momLine ? `Você é a ${momLine}` : null, gestationLine]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <Button onClick={handleSavePregnancy} disabled={saving} fullWidth>
              Salvar gestação
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Dados pessoais</h3>
          <div className="flex flex-col gap-3">
            <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={handleSaveName} disabled={saving} fullWidth>
              Salvar nome
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Metas de glicemia</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            {user?.is_premium
              ? "Ajuste conforme orientação da sua equipe de saúde."
              : "Personalização disponível no Kit Consulta Premium."}
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Input
              label="Jejum"
              type="number"
              value={String(targetJejum)}
              onChange={(e) => setTargetJejum(Number(e.target.value))}
              disabled={!user?.is_premium}
            />
            <Input
              label="1h pós"
              type="number"
              value={String(targetPos1h)}
              onChange={(e) => setTargetPos1h(Number(e.target.value))}
              disabled={!user?.is_premium}
            />
            <Input
              label="2h pós"
              type="number"
              value={String(targetPos2h)}
              onChange={(e) => setTargetPos2h(Number(e.target.value))}
              disabled={!user?.is_premium}
            />
          </div>
          <Button
            onClick={handleSaveTargets}
            disabled={saving || !user?.is_premium}
            variant="secondary"
            fullWidth
          >
            Salvar metas
          </Button>
        </Card>

        {user?.is_premium && (
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Resumo semanal por e-mail</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Receba todo domingo (via cron) o resumo dos últimos 7 dias.
                </p>
              </div>
              <Toggle checked={weeklyEmail} onChange={handleToggleWeeklyEmail} label="E-mail semanal" />
            </div>
            <ul className="mt-4 flex flex-col gap-1">
              {PREMIUM_KIT_FEATURES.slice(0, 3).map((f) => (
                <li key={f} className="text-xs text-gray-500 flex gap-1.5">
                  <span className="text-green-600">✓</span> {f}
                </li>
              ))}
            </ul>
          </Card>
        )}

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
              onChange={handleToggleReminders}
              label="Ativar lembretes"
            />
          </div>

          {!reminders.enabled && (
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Ative para receber lembretes nos horários de medição. Não enviamos se você já
              registrou no dia.
            </p>
          )}

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
            </div>
          )}
        </Card>

        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Ajuda & feedback</p>
            <p className="text-xs text-gray-500 mt-0.5">Dúvidas, sugestões ou reportar problemas</p>
          </div>
          <Link
            href="/ajuda"
            className="shrink-0 rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            Abrir
          </Link>
        </Card>

        <Card className="flex flex-col gap-2">
          <p className="font-semibold text-gray-900 text-sm">Privacidade e dados</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Você pode solicitar informações ou exclusão pelo e-mail{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-brand-600 font-medium">
              {LEGAL_CONTACT_EMAIL}
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <a href={LEGAL_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium">
              Política de Privacidade
            </a>
            <a href={LEGAL_TERMS_URL} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium">
              Termos de Uso
            </a>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="self-start text-xs text-gray-400 hover:text-red-600 underline-offset-2 hover:underline mt-1"
          >
            Excluir minha conta permanentemente
          </button>
        </Card>

        <Button variant="danger" fullWidth onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </main>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir conta permanentemente?">
        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
          Esta ação não pode ser desfeita. Todas as suas medições e dados da conta serão removidos.
        </p>
        <p className="text-xs text-red-600 mb-4">
          Tem certeza? Se quiser apenas sair deste aparelho, use &quot;Sair da conta&quot; abaixo.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              try {
                await api.delete("/user/me");
                toast("Conta excluída", "success");
                setDeleteOpen(false);
                logout();
              } catch {
                toast("Erro ao excluir conta", "error");
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? "Excluindo..." : "Excluir conta"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
