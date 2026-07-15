"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirstName } from "@/lib/utils";
import { welcomeMomTitle } from "@/lib/pregnancy";
import { APP_NAME } from "@/lib/brand";
import { SideMenu } from "./SideMenu";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/login") return null;

  const defaultTitle = welcomeMomTitle(getFirstName(user?.name), user?.pregnancy);

  return (
    <>
      <header className="sticky top-0 z-30 bg-brand-50/90 backdrop-blur-md safe-top">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-brand-600 uppercase tracking-wide">
                {APP_NAME}
              </p>
              <h1 className="truncate text-lg font-bold text-gray-900">
                {title ?? defaultTitle}
              </h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:text-brand-600 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
