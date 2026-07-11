"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "./BottomNav";
import { Toast } from "@/components/ui/Toast";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (loading || (!user && !isLogin)) {
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
      <div className={isLogin ? "min-h-screen" : "min-h-screen pb-24"}>{children}</div>
      <BottomNav />
      <Toast />
    </>
  );
}
