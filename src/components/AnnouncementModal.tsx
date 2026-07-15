"use client";

import Link from "next/link";
import { Heart, Megaphone, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { AppAnnouncement } from "@/types";

const KIND_STYLES = {
  feature: {
    color: "bg-brand-100 text-brand-600",
    badge: "Novidade",
    Icon: Sparkles,
  },
  campaign: {
    color: "bg-amber-100 text-amber-700",
    badge: "Campanha",
    Icon: Megaphone,
  },
  info: {
    color: "bg-sky-100 text-sky-700",
    badge: "Aviso",
    Icon: Megaphone,
  },
} as const;

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

interface AnnouncementModalProps {
  announcement: AppAnnouncement | null;
  onDismiss: () => void;
  dismissing?: boolean;
}

export function AnnouncementModal({
  announcement,
  onDismiss,
  dismissing = false,
}: AnnouncementModalProps) {
  if (!announcement) return null;

  const style = KIND_STYLES[announcement.kind] || KIND_STYLES.feature;
  const Icon = style.Icon;
  const href = announcement.ctaHref?.trim() || "";
  const label = announcement.ctaLabel?.trim() || "Saiba mais";

  return (
    <Modal open={!!announcement} onClose={onDismiss} title={style.badge}>
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                style.color
              )}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {style.badge}
              </p>
              <h3 className="mt-1 text-base font-bold text-gray-900 leading-snug">
                {announcement.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {announcement.body}
              </p>
            </div>
          </div>
        </div>

        {href ? (
          isInternalHref(href) ? (
            <Link href={href} onClick={onDismiss} className="block">
              <Button fullWidth disabled={dismissing}>
                <Heart className="h-4 w-4 fill-current" />
                {label}
              </Button>
            </Link>
          ) : (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block">
              <Button fullWidth disabled={dismissing} onClick={onDismiss}>
                {label}
              </Button>
            </a>
          )
        ) : (
          <Button fullWidth onClick={onDismiss} disabled={dismissing}>
            <Heart className="h-4 w-4 fill-current" />
            Entendi
          </Button>
        )}

        <button
          type="button"
          onClick={onDismiss}
          disabled={dismissing}
          className="text-xs text-gray-400 hover:text-gray-600 text-center"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}
