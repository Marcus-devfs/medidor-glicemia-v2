"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, History, BarChart3, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/comunidade", label: "Comunidade", icon: Users },
  { href: "/medicao", label: "Medir", icon: PlusCircle, highlight: true },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/relatorio", label: "Relatório", icon: BarChart3 },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2 pb-3">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname === href || (href === "/comunidade" && pathname.startsWith("/comunidade"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1 text-xs font-medium transition-colors",
                active ? "text-brand-600" : "text-gray-400 hover:text-brand-500"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl transition-all",
                  highlight && !active && "bg-brand-600 text-white shadow-md",
                  highlight && active && "bg-brand-700 text-white shadow-md",
                  !highlight && active && "bg-brand-50"
                )}
              >
                <Icon className={cn("h-5 w-5", highlight && "h-6 w-6")} />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
