"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { AnnouncementModal } from "@/components/AnnouncementModal";
import { api } from "@/lib/api";
import type { AppAnnouncement } from "@/types";

const PUBLIC_PATHS = ["/login", "/recuperar-senha", "/redefinir-senha"];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/compartilhar/")) return true;
  return false;
}

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { isOpen: onboardingOpen } = useOnboarding();
  const [queue, setQueue] = useState<AppAnnouncement[]>([]);
  const [dismissing, setDismissing] = useState(false);

  const load = useCallback(() => {
    if (!user?._id || isPublicPath(pathname)) {
      setQueue([]);
      return;
    }
    api
      .get<AppAnnouncement[]>("/announcements/active")
      .then(({ data }) => setQueue(Array.isArray(data) ? data : []))
      .catch(() => setQueue([]));
  }, [user?._id, pathname]);

  useEffect(() => {
    if (onboardingOpen) return;
    const timer = setTimeout(load, 500);
    return () => clearTimeout(timer);
  }, [load, onboardingOpen]);

  const current = !onboardingOpen && queue.length > 0 ? queue[0] : null;

  const dismiss = async () => {
    if (!current || dismissing) return;
    const id = current._id;
    setDismissing(true);
    setQueue((prev) => prev.filter((a) => a._id !== id));
    try {
      await api.post(`/announcements/${id}/dismiss`);
    } catch {
      load();
    } finally {
      setDismissing(false);
    }
  };

  return (
    <>
      {children}
      <AnnouncementModal
        announcement={current}
        onDismiss={dismiss}
        dismissing={dismissing}
      />
    </>
  );
}
