import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateBR } from "@/lib/utils";
import { GLUCOSE_PERIODS, TARGET_INFO } from "@/lib/utils";
import type { Medicao, User } from "@/types";

const PERIOD_ORDER = GLUCOSE_PERIODS.map((p) => p.value);

function formatGestationId(userId: string) {
  return userId.slice(-8).toUpperCase();
}

function groupByDate(markings: Medicao[]) {
  const map = new Map<string, Map<string, Medicao>>();

  for (const m of markings) {
    const dateKey = formatDateBR(m.date);
    if (!map.has(dateKey)) map.set(dateKey, new Map());
    map.get(dateKey)!.set(m.period, m);
  }

  return Array.from(map.entries()).sort((a, b) => {
    const [da, ma, ya] = a[0].split("/").map(Number);
    const [db, mb, yb] = b[0].split("/").map(Number);
    return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
  });
}

export function generateHistoryPdf(user: User, markings: Medicao[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const gestationId = formatGestationId(user._id);

  doc.setFillColor(219, 39, 119);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("GestaGlic — Relatório de Glicemia", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Paciente: ${user.name}`, 14, 20);
  doc.text(`ID da gestação: ${gestationId}`, 120, 20);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.text(`Gerado em ${formatDateBR(new Date())}`, 14, 34);

  const grouped = groupByDate(markings);
  const headers = ["Data", ...PERIOD_ORDER.map((p) => p.replace("Após ", "Pós-"))];

  const body = grouped.map(([date, periods]) => [
    date,
    ...PERIOD_ORDER.map((period) => {
      const m = periods.get(period);
      return m ? `${m.value} mg/dL` : "—";
    }),
  ]);

  autoTable(doc, {
    startY: 40,
    head: [headers],
    body,
    theme: "grid",
    headStyles: {
      fillColor: [219, 39, 119],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold", cellWidth: 24 },
    },
    alternateRowStyles: { fillColor: [253, 242, 248] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 40;

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(TARGET_INFO, 14, finalY + 8, { maxWidth: 182 });

  doc.save(`gestaglic-${gestationId}-${formatDateBR(new Date()).replace(/\//g, "-")}.pdf`);
}
