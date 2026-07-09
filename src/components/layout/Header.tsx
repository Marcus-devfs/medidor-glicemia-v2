"use client";

import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirstName } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-30 bg-brand-50/90 backdrop-blur-md safe-top">
      <div className="mx-auto max-w-lg px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <Heart className="h-5 w-5 fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-brand-600 uppercase tracking-wide">
              Saudável Glicose
            </p>
            <h1 className="truncate text-lg font-bold text-gray-900">
              {title ?? `Olá, ${getFirstName(user?.name)}! 💗`}
            </h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    </header>
  );
}
