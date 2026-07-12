"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLD = 72;
const MAX_PULL = 110;

function getScrollTop() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, disabled, children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  onRefreshRef.current = onRefresh;

  useEffect(() => {
    pullRef.current = pull;
  }, [pull]);

  useEffect(() => {
    if (disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing || getScrollTop() > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return;

      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY <= 0) {
        pullRef.current = 0;
        setPull(0);
        return;
      }

      if (getScrollTop() > 0) {
        pulling.current = false;
        pullRef.current = 0;
        setPull(0);
        return;
      }

      e.preventDefault();
      const next = Math.min(deltaY * 0.45, MAX_PULL);
      pullRef.current = next;
      setPull(next);
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;

      const distance = pullRef.current;
      if (distance >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPull(THRESHOLD);
        try {
          await onRefreshRef.current();
          navigator.vibrate?.(12);
        } finally {
          setRefreshing(false);
          pullRef.current = 0;
          setPull(0);
        }
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [disabled, refreshing]);

  const offset = refreshing ? THRESHOLD : pull;
  const ready = !refreshing && pull >= THRESHOLD;

  return (
    <>
      <div
        className="fixed left-0 right-0 z-[60] pointer-events-none flex flex-col items-center safe-top"
        style={{
          transform: `translateY(${Math.max(0, offset - 44)}px)`,
          opacity: offset > 8 || refreshing ? 1 : 0,
          transition: pulling.current ? "none" : "transform 0.22s ease-out, opacity 0.15s",
        }}
        aria-hidden
      >
        <div
          className={cn(
            "mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border",
            ready ? "border-brand-200 text-brand-600" : "border-gray-100 text-gray-400"
          )}
        >
          <Loader2
            className={cn("h-5 w-5", refreshing && "animate-spin")}
            style={!refreshing ? { transform: `rotate(${pull * 2.5}deg)` } : undefined}
          />
        </div>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
          {refreshing ? "Atualizando..." : ready ? "Solte para atualizar" : "Puxe para atualizar"}
        </p>
      </div>

      <div
        style={{
          transform: offset > 0 ? `translateY(${offset}px)` : undefined,
          transition: pulling.current || refreshing ? "none" : "transform 0.22s ease-out",
        }}
      >
        {children}
      </div>
    </>
  );
}
