import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/mock-data";

export function KpiCard({
  label,
  value,
  unit,
  delta,
  caption,
  icon: Icon,
  status = "ok",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  caption?: string;
  icon?: LucideIcon;
  status?: Status;
}) {
  const Trend = delta === undefined || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "grid size-8 place-items-center rounded-md",
              status === "ok" && "bg-status-ok-soft text-status-ok",
              status === "warning" && "bg-status-warning-soft text-status-warning",
              status === "critical" && "bg-status-critical-soft text-status-critical",
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="tabular font-display text-3xl font-semibold text-foreground">
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              "tabular inline-flex items-center gap-1 font-medium",
              delta > 0 ? "text-status-ok" : delta < 0 ? "text-status-critical" : "text-muted-foreground",
            )}
          >
            <Trend className="size-3.5" />
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}
          </span>
        )}
        {caption && <span className="text-muted-foreground">{caption}</span>}
      </div>
    </div>
  );
}
