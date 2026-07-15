"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Trash2, Pencil } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MeasureForm } from "@/components/measure/MeasureForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRegisterPageRefresh } from "@/contexts/RefreshContext";
import { api } from "@/lib/api";
import { formatDateBR, groupMarkingsByDate, removeAccents, sortMarkingsByDate } from "@/lib/utils";
import { getGlucoseStatus, getStatusColor, getStatusLabel } from "@/lib/glucose";
import { useGlucoseTargets } from "@/hooks/useGlucoseTargets";
import { cn } from "@/lib/utils";
import type { Medicao } from "@/types";

export default function HistoricoPage() {
  const { user, toast } = useAuth();
  const targets = useGlucoseTargets();
  const [markings, setMarkings] = useState<Medicao[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<Medicao | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const { data } = await api.get<Medicao[]>(`/marking/list/${user._id}`);
      setMarkings(sortMarkingsByDate(data, true));
    } catch {
      toast("Erro ao carregar histórico", "error");
    } finally {
      setLoading(false);
    }
  }, [user?._id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useRegisterPageRefresh(load);

  const filtered = markings.filter((m) => {
    if (!search) return true;
    const term = removeAccents(search.toLowerCase());
    return (
      removeAccents(m.period.toLowerCase()).includes(term) ||
      removeAccents(m.food?.toLowerCase() ?? "").includes(term) ||
      String(m.value).includes(term) ||
      formatDateBR(m.date).includes(term)
    );
  });

  const grouped = useMemo(() => groupMarkingsByDate(filtered, true), [filtered]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/marking/delete/${deleteId}`);
      toast("Medição excluída", "success");
      setDeleteId(null);
      load();
    } catch {
      toast("Erro ao excluir", "error");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Header title="Histórico" subtitle={`${filtered.length} medições`} />

      <main className="flex flex-col gap-4 px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-400 text-sm">Nenhuma medição encontrada</p>
          </Card>
        ) : (
          grouped.map((group) => (
            <section key={group.dateKey} className="flex flex-col gap-3">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {group.dateLabel}
              </h2>
              {group.items.map((m) => {
                const status = getGlucoseStatus(m.value, m.period, targets);
                return (
                  <Card key={m._id} className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{m.period}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditItem(m)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(m._id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {m.value} <span className="text-sm font-normal text-gray-400">mg/dL</span>
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                          getStatusColor(status)
                        )}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </div>
                    {m.food && <p className="text-xs text-gray-500">🍽 {m.food}</p>}
                    <p className="text-xs text-gray-400">Dieta: {m.diet ? "Sim ✓" : "Não"}</p>
                  </Card>
                );
              })}
            </section>
          ))
        )}
      </main>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir medição?">
        <p className="text-sm text-gray-600 mb-4">Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" fullWidth onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Editar medição">
        {editItem && (
          <MeasureForm
            mode="edit"
            markingId={editItem._id}
            initialData={editItem}
            redirectOnSuccess={false}
            onSuccess={() => {
              setEditItem(null);
              load();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
