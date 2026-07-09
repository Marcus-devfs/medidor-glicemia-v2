import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl bg-white p-4 shadow-card border border-brand-100/50", className)}
      {...props}
    >
      {children}
    </div>
  );
}
