"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight, Users, X } from "lucide-react";
import { LP_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const LINKS = [
  {
    href: "/comunidade",
    label: "Comunidade",
    description: "Troque experiências com outras gestantes",
    icon: Users,
    external: false,
  },
  {
    href: `${LP_URL}/dicas`,
    label: "Dicas para você",
    description: "Artigos sobre gestação e glicemia",
    icon: BookOpen,
    external: true,
  },
];

export function SideMenu({ open, onClose }: SideMenuProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-[min(100%,280px)] flex-col bg-white shadow-xl transition-transform duration-300 safe-top safe-bottom",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <p className="font-bold text-gray-900">Menu</p>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {LINKS.map(({ href, label, description, icon: Icon, external }) => {
            const active = !external && (pathname === href || pathname.startsWith(href + "/"));
            const className = cn(
              "flex items-start gap-3 rounded-xl px-3 py-3 transition-colors",
              active ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-50"
            );

            const content = (
              <>
                <span className={cn("mt-0.5 rounded-lg p-2", active ? "bg-brand-100" : "bg-gray-100")}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    {label}
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5 leading-snug">{description}</span>
                </span>
              </>
            );

            if (external) {
              return (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={href} href={href} onClick={onClose} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
