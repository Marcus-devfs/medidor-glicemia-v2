"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PullToRefresh } from "@/components/layout/PullToRefresh";

interface RefreshContextValue {
  refreshKey: number;
  registerPageRefresh: (fn: () => Promise<void>) => void;
  unregisterPageRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const handlerRef = useRef<(() => Promise<void>) | null>(null);

  const registerPageRefresh = useCallback((fn: () => Promise<void>) => {
    handlerRef.current = fn;
  }, []);

  const unregisterPageRefresh = useCallback(() => {
    handlerRef.current = null;
  }, []);

  const triggerRefresh = useCallback(async () => {
    setRefreshKey((k) => k + 1);
    if (handlerRef.current) {
      await handlerRef.current();
    }
  }, []);

  const value = useMemo(
    () => ({ refreshKey, registerPageRefresh, unregisterPageRefresh }),
    [refreshKey, registerPageRefresh, unregisterPageRefresh]
  );

  return (
    <RefreshContext.Provider value={value}>
      <PullToRefresh onRefresh={triggerRefresh} disabled={!enabled}>
        {children}
      </PullToRefresh>
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const ctx = useContext(RefreshContext);
  if (!ctx) throw new Error("useRefresh must be used within RefreshProvider");
  return ctx;
}

/** Registra o recarregamento de dados da página atual (pull-to-refresh). */
export function useRegisterPageRefresh(fn: () => Promise<void>) {
  const { registerPageRefresh, unregisterPageRefresh } = useRefresh();
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    registerPageRefresh(async () => fnRef.current());
    return () => unregisterPageRefresh();
  }, [registerPageRefresh, unregisterPageRefresh]);
}

/** Sinal para recarregar widgets secundários (feeds na home). */
export function useRefreshSignal() {
  return useRefresh().refreshKey;
}
