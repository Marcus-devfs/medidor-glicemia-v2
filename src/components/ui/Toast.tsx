"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-brand-50 border-brand-200 text-brand-800",
};

export function Toast() {
  const { toastMessage, clearToast } = useAuth();

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(clearToast, 4000);
    return () => clearTimeout(t);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const Icon = icons[toastMessage.type];

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex justify-center safe-top">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-card-lg max-w-md w-full",
          styles[toastMessage.type]
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm font-medium">{toastMessage.message}</p>
        <button onClick={clearToast} className="shrink-0 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
