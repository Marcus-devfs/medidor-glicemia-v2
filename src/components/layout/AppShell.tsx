"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "./BottomNav";
import { Toast } from "@/components/ui/Toast";
import { RefreshProvider } from "@/contexts/RefreshContext";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider";

const PUBLIC_PATHS = ["/login", "/recuperar-senha", "/redefinir-senha"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (loading || (!user && !isPublic)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PwaInstallProvider />
      <RefreshProvider enabled={!isPublic}>
        <div className={isPublic ? "min-h-screen" : "min-h-screen pb-24"}>{children}</div>
      </RefreshProvider>
      {!isPublic && <BottomNav />}
      <Toast />
    </>
  );
}
