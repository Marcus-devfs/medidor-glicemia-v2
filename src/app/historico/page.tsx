"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Pencil, Download } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MeasureForm } from "@/components/measure/MeasureForm";
import { PdfLimitModal } from "@/components/premium/PdfLimitModal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { generateHistoryPdf } from "@/lib/pdf";
import { formatDateBR, removeAccents } from "@/lib/utils";
import { getGlucoseStatus, getStatusColor, getStatusLabel } from "@/lib/glucose";
import { cn } from "@/lib/utils";
import type { Medicao } from "@/types";

export default function HistoricoPage() {
  const { user, toast, updateUser } = useAuth();
  const [markings, setMarkings] = useState<Medicao[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<Medicao | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const { data } = await api.get<Medicao[]>(`/marking/list/${user._id}`);
      setMarkings(
        [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch {
      toast("Erro ao carregar histórico", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?._id]);

  const filtered = markings.filter((m) => {
    if (!search) return true;
    const term = removeAccents(search.toLowerCase());
    return (
      removeAccents(m.period.toLowerCase()).includes(term) ||
      removeAccents(m.food?.toLowerCase() ?? "").includes(term) ||
      String(m.value).includes(term)
    );
  });

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

  const exportPdf = async () => {
    if (!user?._id || filtered.length === 0) {
      toast("Nenhuma medição para exportar", "error");
      return;
    }

    setExporting(true);
    try {
      const { data } = await api.post<{
        allowed: boolean;
        limit_reached?: boolean;
        pdf_downloads_count: number;
        is_premium: boolean;
      }>(`/user/pdf-download/${user._id}`);

      if (!data.allowed) {
        setShowLimitModal(true);
        return;
      }

      generateHistoryPdf(user, filtered);
      updateUser({
        ...user,
        pdf_downloads_count: data.pdf_downloads_count,
        is_premium: data.is_premium,
      });
      toast("PDF exportado!", "success");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { limit_reached?: boolean } } };
      if (axiosErr.response?.status === 403 && axiosErr.response?.data?.limit_reached) {
        setShowLimitModal(true);
      } else {
        toast("Erro ao exportar PDF", "error");
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Header title="Histórico" subtitle={`${filtered.length} medições`} />

      <main className="flex flex-col gap-4 px-4 pb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={exportPdf}
            disabled={exporting || filtered.length === 0}
            className="shrink-0 px-3"
            title="Exportar PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-400 text-sm">Nenhuma medição encontrada</p>
          </Card>
        ) : (
          filtered.map((m) => {
            const status = getGlucoseStatus(m.value, m.period);
            return (
              <Card key={m._id} className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{m.period}</p>
                    <p className="text-xs text-gray-400">{formatDateBR(m.date)}</p>
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
          })
        )}
      </main>

      <PdfLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />

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
