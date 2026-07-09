"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-card-lg",
          "max-h-[92dvh] safe-bottom"
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
