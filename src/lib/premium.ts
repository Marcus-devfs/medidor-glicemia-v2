export const DEFAULT_FREE_PDF_LIMIT = 5;
export const DEFAULT_PREMIUM_PRICE = 14.9;

export function formatPremiumPrice(price: number = DEFAULT_PREMIUM_PRICE): string {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const PREMIUM_ONE_TIME_NOTE =
  "Pagamento único — sem mensalidade nem assinatura recorrente.";

/** @deprecated Use usePremiumSettings().freePdfLimit */
export const FREE_PDF_LIMIT = DEFAULT_FREE_PDF_LIMIT;

/** @deprecated Use usePremiumSettings().premiumPrice */
export const PREMIUM_PRICE = DEFAULT_PREMIUM_PRICE;
