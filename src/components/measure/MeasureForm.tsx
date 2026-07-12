"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { GLUCOSE_PERIODS } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import type { Medicao, MedicaoForm } from "@/types";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().split("T")[0];

function toFormData(item: Medicao): MedicaoForm {
  return {
    date: item.date.split("T")[0],
    period: item.period,
    value: String(item.value),
    diet: item.diet ? 1 : 0,
    food: item.food ?? "",
  };
}

interface MeasureFormProps {
  onSuccess?: () => void;
  mode?: "create" | "edit";
  markingId?: string;
  initialData?: Medicao;
  redirectOnSuccess?: boolean;
  submitLabel?: string;
}

export function MeasureForm({
  onSuccess,
  mode = "create",
  markingId,
  initialData,
  redirectOnSuccess = mode === "create",
  submitLabel,
}: MeasureFormProps) {
  const { user, toast } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MedicaoForm>(
    initialData ? toFormData(initialData) : { date: today(), period: "", value: "", diet: null, food: "" }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.period || !form.value || form.diet === null) {
      toast("Preencha todos os campos obrigatórios", "error");
      return;
    }

    setLoading(true);
    try {
      const marking = {
        date: form.date,
        period: form.period,
        value: Number(form.value),
        diet: form.diet,
        food: form.food,
      };

      if (mode === "edit" && markingId) {
        await api.patch(`/marking/update/${markingId}`, { marking });
        toast("Medição atualizada!", "success");
      } else {
        await api.post(`/marking/create/${user?._id}`, { marking });
        toast("Medição registrada com sucesso! 💗", "success");
        setForm({ date: today(), period: "", value: "", diet: null, food: "" });
      }

      onSuccess?.();
      if (redirectOnSuccess) router.push("/historico");
    } catch {
      toast(
        mode === "edit" ? "Erro ao atualizar medição." : "Erro ao registrar medição. Tente novamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Data"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Período</label>
        <div className="grid grid-cols-2 gap-2">
          {GLUCOSE_PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setForm({ ...form, period: p.value })}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-all",
                form.period === p.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-200"
              )}
            >
              <span className="text-lg">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Valor (mg/dL)"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Ex: 95"
        value={form.value}
        onChange={(e) => setForm({ ...form, value: e.target.value.replace(/\D/g, "") })}
        required
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Dentro da dieta?</label>
        <div className="flex gap-3">
          {[
            { label: "Sim", value: 1 as const },
            { label: "Não", value: 0 as const },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm({ ...form, diet: opt.value })}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                form.diet === opt.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-600"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="O que comeu? (opcional)"
        value={form.food}
        onChange={(e) => setForm({ ...form, food: e.target.value })}
        rows={3}
        placeholder="Descreva o que consumiu..."
      />

      {mode === "create" && (
        <Card className="bg-brand-50 border-brand-100">
          <p className="text-xs text-brand-700 leading-relaxed">
            💡 <strong>Meta gestacional:</strong> jejum &lt; 95 mg/dL · 1h após refeição &lt; 179 mg/dL · 2h ≤ 152 mg/dL
          </p>
        </Card>
      )}

      <Button type="submit" fullWidth size="lg" disabled={loading} className="mb-2">
        {loading ? "Salvando..." : submitLabel ?? (mode === "edit" ? "Salvar alterações" : "Registrar medição")}
      </Button>
    </form>
  );
}
