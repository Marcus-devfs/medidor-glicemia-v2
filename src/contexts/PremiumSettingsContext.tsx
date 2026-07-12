"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import {
  DEFAULT_FREE_PDF_LIMIT,
  DEFAULT_PREMIUM_PRICE,
  formatPremiumPrice as formatPrice,
} from "@/lib/premium";

interface PremiumSettingsValue {
  premiumPrice: number;
  freePdfLimit: number;
  loading: boolean;
  refresh: () => Promise<void>;
  formatPremiumPrice: () => string;
}

const PremiumSettingsContext = createContext<PremiumSettingsValue | null>(null);

export function PremiumSettingsProvider({ children }: { children: ReactNode }) {
  const [premiumPrice, setPremiumPrice] = useState(DEFAULT_PREMIUM_PRICE);
  const [freePdfLimit, setFreePdfLimit] = useState(DEFAULT_FREE_PDF_LIMIT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<{ premiumPrice: number; freePdfLimit: number }>(
        "/settings/premium"
      );
      setPremiumPrice(data.premiumPrice);
      setFreePdfLimit(data.freePdfLimit);
    } catch {
      // mantém defaults locais
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      premiumPrice,
      freePdfLimit,
      loading,
      refresh,
      formatPremiumPrice: () => formatPrice(premiumPrice),
    }),
    [premiumPrice, freePdfLimit, loading, refresh]
  );

  return (
    <PremiumSettingsContext.Provider value={value}>
      {children}
    </PremiumSettingsContext.Provider>
  );
}

export function usePremiumSettings() {
  const ctx = useContext(PremiumSettingsContext);
  if (!ctx) {
    throw new Error("usePremiumSettings must be used within PremiumSettingsProvider");
  }
  return ctx;
}
