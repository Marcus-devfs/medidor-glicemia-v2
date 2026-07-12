import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { APP_ICON } from "@/lib/brand";
import { formatDateBR, GLUCOSE_PERIODS } from "@/lib/utils";
import {
  calcAverage,
  formatTargetsLine,
  getGlucoseStatus,
  getStatusLabel,
  resolveGlucoseTargets,
} from "@/lib/glucose";
import { formatDueDate, fetusCountLabel, getGestationalWeek } from "@/lib/pregnancy";
import type { PdfTemplate } from "@/lib/premium";
import { getTemplateLabel } from "@/lib/reportStats";
import type { GlucosePeriod, Medicao, User } from "@/types";

const PERIOD_ORDER = GLUCOSE_PERIODS.map((p) => p.value);
const BRAND = { r: 219, g: 39, b: 119 };
const BRAND_LIGHT = { r: 253, g: 242, b: 248 };

export interface ReportPdfStats {
  jejumAvg: number;
  aposAvg: number;
  inTargetPct: number;
  total: number;
}

export interface ReportPdfOptions {
  year?: string;
  stats: ReportPdfStats;
  template?: PdfTemplate;
}

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

async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch(APP_ICON);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function statusColor(status: ReturnType<typeof getGlucoseStatus>) {
  switch (status) {
    case "normal":
      return [34, 197, 94] as [number, number, number];
    case "warning":
      return [245, 158, 11] as [number, number, number];
    case "danger":
      return [239, 68, 68] as [number, number, number];
  }
}

function drawHeader(
  doc: jsPDF,
  user: User,
  logo: string | null,
  options: ReportPdfOptions
) {
  const gestationId = formatGestationId(user._id);
  const template = options.template ?? "completo";
  const periodLabel =
    template !== "completo"
      ? getTemplateLabel(template)
      : options.year && options.year !== "todos"
        ? `Ano ${options.year}`
        : "Histórico completo";

  const week = getGestationalWeek(user.pregnancy?.dueDate);
  const fetusCount = user.pregnancy?.fetusCount ?? 1;
  const hasPregnancyInfo = week != null || user.pregnancy?.dueDate;

  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.roundedRect(14, 12, 182, 32, 3, 3, "F");

  if (logo) {
    doc.addImage(logo, "PNG", 18, 16, 24, 24);
  }

  const textX = logo ? 46 : 18;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("GestaGlic", textX, 22);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório de Glicemia Gestacional", textX, 28);

  doc.setFontSize(8);
  doc.text(`Gerado em ${formatDateBR(new Date())}`, 148, 22);
  doc.text(periodLabel, 148, 28, { maxWidth: 50 });
  doc.text(`ID: ${gestationId}`, 148, 34);

  const infoHeight = hasPregnancyInfo ? 26 : 18;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 48, 182, infoHeight, 2, 2, "F");
  doc.setDrawColor(240, 240, 240);
  doc.roundedRect(14, 48, 182, infoHeight, 2, 2, "S");

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Paciente:", 18, 56);
  doc.setFont("helvetica", "normal");
  doc.text(user.name, 38, 56);

  doc.setFont("helvetica", "bold");
  doc.text("E-mail:", 18, 62);
  doc.setFont("helvetica", "normal");
  doc.text(user.email, 34, 62);

  if (hasPregnancyInfo) {
    doc.setFont("helvetica", "bold");
    doc.text("Gestação:", 18, 68);
    doc.setFont("helvetica", "normal");
    const parts: string[] = [];
    if (week != null) parts.push(`${week}ª semana`);
    if (user.pregnancy?.dueDate) parts.push(`DPP ${formatDueDate(user.pregnancy.dueDate)}`);
    if (fetusCount > 1) parts.push(fetusCountLabel(fetusCount));
    doc.text(parts.join(" · "), 38, 68);
  }

  doc.setFont("helvetica", "bold");
  doc.text("ID Gestação:", 110, 56);
  doc.setFont("helvetica", "normal");
  doc.text(gestationId, 136, 56);

  return { gestationId, summaryStartY: 48 + infoHeight + 6 };
}

function drawSummaryCards(doc: jsPDF, stats: ReportPdfStats, startY: number) {
  const cards = [
    { label: "Média Jejum", value: stats.jejumAvg > 0 ? `${stats.jejumAvg} mg/dL` : "—" },
    { label: "Média Pós-refeição", value: stats.aposAvg > 0 ? `${stats.aposAvg} mg/dL` : "—" },
    { label: "Dentro da meta", value: `${stats.inTargetPct}%` },
    { label: "Total medições", value: String(stats.total) },
  ];

  const cardW = 43;
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 3);
    doc.setFillColor(BRAND_LIGHT.r, BRAND_LIGHT.g, BRAND_LIGHT.b);
    doc.roundedRect(x, startY, cardW, 16, 2, 2, "F");
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, x + 3, startY + 6);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 3, startY + 12);
  });

  return startY + 22;
}

export async function generateReportPdf(
  user: User,
  markings: Medicao[],
  options: ReportPdfOptions
) {
  const targets = resolveGlucoseTargets(user.glucoseTargets);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const logo = await loadLogoBase64();
  const { gestationId, summaryStartY } = drawHeader(doc, user, logo, options);

  let y = drawSummaryCards(doc, options.stats, summaryStartY);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Registro de Medições", 14, y);
  y += 4;

  const grouped = groupByDate(markings);
  const headers = ["Data", ...PERIOD_ORDER.map((p) => p.replace("Após ", "Pós-"))];

  const body = grouped.map(([date, periods]) => [
    date,
    ...PERIOD_ORDER.map((period) => {
      const m = periods.get(period);
      return m ? `${m.value}` : "—";
    }),
  ]);

  const cellMeta: { row: number; col: number; status: ReturnType<typeof getGlucoseStatus> }[] = [];
  grouped.forEach(([, periods], rowIdx) => {
    PERIOD_ORDER.forEach((period, colIdx) => {
      const m = periods.get(period);
      if (m) {
        cellMeta.push({
          row: rowIdx,
          col: colIdx + 1,
          status: getGlucoseStatus(m.value, period, targets),
        });
      }
    });
  });

  autoTable(doc, {
    startY: y + 2,
    head: [headers],
    body,
    theme: "grid",
    headStyles: {
      fillColor: [BRAND.r, BRAND.g, BRAND.b],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold", cellWidth: 24, textColor: [60, 60, 60] },
    },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: 14, right: 14 },
    didParseCell(data) {
      if (data.section !== "body") return;
      const meta = cellMeta.find((c) => c.row === data.row.index && c.col === data.column.index);
      if (meta) {
        const [r, g, b] = statusColor(meta.status);
        data.cell.styles.textColor = [r, g, b];
      }
    },
  });

  let finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 20;

  finalY += 8;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo por Período", 14, finalY);
  finalY += 4;

  const periodRows = PERIOD_ORDER.map((period) => {
    const items = markings.filter((m) => m.period === period);
    const avg = calcAverage(items.map((m) => m.value));
    const status = avg > 0 ? getGlucoseStatus(avg, period as GlucosePeriod, targets) : null;
    return [
      period,
      items.length > 0 ? String(items.length) : "0",
      avg > 0 ? `${avg} mg/dL` : "—",
      status ? getStatusLabel(status) : "—",
    ];
  });

  autoTable(doc, {
    startY: finalY + 2,
    head: [["Período", "Nº medições", "Média", "Status"]],
    body: periodRows,
    theme: "striped",
    headStyles: {
      fillColor: [100, 100, 100],
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: { fontSize: 8, halign: "center" },
    columnStyles: { 0: { halign: "left" } },
    margin: { left: 14, right: 14 },
  });

  finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? finalY + 20;

  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setLineWidth(0.3);
  doc.line(14, finalY + 6, 196, finalY + 6);

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text(formatTargetsLine(targets), 14, finalY + 12, { maxWidth: 182 });
  doc.text(
    "Documento gerado pelo GestaGlic · gestaglic.com.br · Uso exclusivo para acompanhamento médico.",
    14,
    finalY + 20,
    { maxWidth: 182 }
  );

  const suffix = options.template && options.template !== "completo" ? `-${options.template}` : "";
  doc.save(
    `gestaglic-relatorio-${gestationId}${suffix}-${formatDateBR(new Date()).replace(/\//g, "-")}.pdf`
  );
}

/** @deprecated Use generateReportPdf */
export const generateHistoryPdf = generateReportPdf;
