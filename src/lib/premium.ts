export const DEFAULT_GLUCOSE_TARGETS = {
  jejum: 95,
  pos1h: 179,
  pos2h: 152,
} as const;

export type GlucoseTargets = {
  jejum: number;
  pos1h: number;
  pos2h: number;
};

export type PdfTemplate = "completo" | "consulta7" | "consulta14" | "consulta30";

export const PDF_TEMPLATES: {
  id: PdfTemplate;
  label: string;
  days: number | null;
  premium: boolean;
  description: string;
}[] = [
  {
    id: "consulta7",
    label: "Consulta — 7 dias",
    days: 7,
    premium: true,
    description: "Ideal para retorno semanal",
  },
  {
    id: "consulta14",
    label: "Consulta — 14 dias",
    days: 14,
    premium: true,
    description: "Período quinzenal mais usado",
  },
  {
    id: "consulta30",
    label: "Consulta — 30 dias",
    days: 30,
    premium: true,
    description: "Visão do último mês",
  },
  {
    id: "completo",
    label: "Completo",
    days: null,
    premium: false,
    description: "Todas as medições do filtro de ano",
  },
];

export const PREMIUM_KIT_FEATURES = [
  "PDFs ilimitados com modelos profissionais (7, 14 e 30 dias)",
  "Link compartilhável com sua obstetra (válido 7 dias)",
  "Resumo semanal no app + e-mail opcional",
  "Metas de glicemia personalizadas pelo seu médico",
  "DPP, semana gestacional e dados da gestação no relatório",
] as const;

export const PREMIUM_ONE_TIME_NOTE =
  "Pagamento único — sem mensalidade nem assinatura recorrente.";

export const DEFAULT_FREE_PDF_LIMIT = 5;
export const DEFAULT_PREMIUM_PRICE = 14.9;

export function formatPremiumPrice(price: number = DEFAULT_PREMIUM_PRICE): string {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** @deprecated Use usePremiumSettings().freePdfLimit */
export const FREE_PDF_LIMIT = DEFAULT_FREE_PDF_LIMIT;

/** @deprecated Use usePremiumSettings().premiumPrice */
export const PREMIUM_PRICE = DEFAULT_PREMIUM_PRICE;
