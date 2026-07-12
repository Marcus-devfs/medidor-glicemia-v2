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
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  clearOnboardingPending,
  hasSeenOnboarding,
  isOnboardingPending,
  markOnboardingSeen,
} from "@/lib/onboarding";
import { OnboardingModal } from "./OnboardingModal";

const PUBLIC_PATHS = ["/login", "/recuperar-senha", "/redefinir-senha"];

interface OnboardingContextValue {
  openOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?._id || PUBLIC_PATHS.includes(pathname)) return;
    if (!isOnboardingPending() || hasSeenOnboarding(user._id)) return;

    const timer = setTimeout(() => {
      clearOnboardingPending();
      setOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [user?._id, pathname]);

  const openOnboarding = useCallback(() => setOpen(true), []);

  const handleComplete = useCallback(() => {
    if (user?._id) markOnboardingSeen(user._id);
    setOpen(false);
  }, [user?._id]);

  const value = useMemo(() => ({ openOnboarding }), [openOnboarding]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingModal open={open} onComplete={handleComplete} userName={user?.name} />
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
