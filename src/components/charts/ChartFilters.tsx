"use client";

import { ChevronDown } from "lucide-react";
import { cn, GLUCOSE_PERIODS } from "@/lib/utils";
import { CHART_DAYS_OPTIONS, type ChartDaysFilter, type ChartPeriodFilter } from "@/lib/reportStats";

interface ChartFiltersProps {
  period: ChartPeriodFilter;
  days: ChartDaysFilter;
  onPeriodChange: (period: ChartPeriodFilter) => void;
  onDaysChange: (days: ChartDaysFilter) => void;
  className?: string;
}

const selectClass = cn(
  "h-8 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50",
  "pl-2.5 pr-7 text-xs font-medium text-gray-700",
  "focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
);

function daysToValue(days: ChartDaysFilter): string {
  return days == null ? "all" : String(days);
}

function valueToDays(value: string): ChartDaysFilter {
  if (value === "all") return null;
  return Number(value) as ChartDaysFilter;
}

export function ChartFilters({
  period,
  days,
  onPeriodChange,
  onDaysChange,
  className,
}: ChartFiltersProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative min-w-[5.5rem]">
        <select
          value={daysToValue(days)}
          onChange={(e) => onDaysChange(valueToDays(e.target.value))}
          className={selectClass}
          aria-label="Período em dias"
        >
          {CHART_DAYS_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value == null ? "all" : String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      </div>

      <div className="relative min-w-[7rem] flex-1">
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as ChartPeriodFilter)}
          className={selectClass}
          aria-label="Tipo de medição"
        >
          <option value="all">Todos</option>
          {GLUCOSE_PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      </div>
    </div>
  );
}
