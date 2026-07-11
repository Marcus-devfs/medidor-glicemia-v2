import { cn } from "@/lib/utils";

/** Estilos compartilhados — evita quebra do Safari/iOS em inputs nativos */
export const formControlClass = cn(
  "block w-full min-h-[48px] rounded-xl border border-gray-200 bg-white px-4 py-3",
  "text-base leading-normal box-border",
  "placeholder:text-gray-400",
  "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
  "appearance-none [-webkit-appearance:none]"
);

export const formLabelClass = "text-sm font-medium text-gray-700";
