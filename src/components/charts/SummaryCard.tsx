import { Card } from "@/components/ui/Card";
import { useGlucoseTargets } from "@/hooks/useGlucoseTargets";
import { getGlucoseStatus, getStatusColor, getStatusLabel } from "@/lib/glucose";
import { cn } from "@/lib/utils";
import type { GlucosePeriod } from "@/types";

interface SummaryCardProps {
  label: string;
  value: number;
  period: GlucosePeriod;
  icon: string;
}

export function SummaryCard({ label, value, period, icon }: SummaryCardProps) {
  const targets = useGlucoseTargets();
  const status = value > 0 ? getGlucoseStatus(value, period, targets) : null;

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {value > 0 ? value : "—"}
        {value > 0 && <span className="text-base font-normal text-gray-400 ml-1">mg/dL</span>}
      </p>
      {status && (
        <span
          className={cn(
            "inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            getStatusColor(status)
          )}
        >
          {getStatusLabel(status)}
        </span>
      )}
    </Card>
  );
}
