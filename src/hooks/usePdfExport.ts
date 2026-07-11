"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { generateReportPdf, type ReportPdfStats } from "@/lib/pdf";
import type { Medicao } from "@/types";

export function usePdfExport() {
  const { user, toast, updateUser } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const exportPdf = async (
    markings: Medicao[],
    options: { year?: string; stats: ReportPdfStats }
  ) => {
    if (!user?._id) return;
    if (markings.length === 0) {
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

      await generateReportPdf(user, markings, options);
      updateUser({
        ...user,
        pdf_downloads_count: data.pdf_downloads_count,
        is_premium: data.is_premium,
      });
      toast("Relatório PDF exportado!", "success");
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { limit_reached?: boolean } };
      };
      if (axiosErr.response?.status === 403 && axiosErr.response?.data?.limit_reached) {
        setShowLimitModal(true);
      } else {
        toast("Erro ao exportar PDF", "error");
      }
    } finally {
      setExporting(false);
    }
  };

  return { exportPdf, exporting, showLimitModal, setShowLimitModal };
}
