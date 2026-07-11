export const FREE_PDF_LIMIT = 5;
export const PREMIUM_PRICE = 6.95;

export function formatPremiumPrice(): string {
  return PREMIUM_PRICE.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const PREMIUM_ONE_TIME_NOTE =
  "Pagamento único — sem mensalidade nem assinatura recorrente.";
