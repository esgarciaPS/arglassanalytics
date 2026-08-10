import { cn } from "@/lib/utils";
import type { Status } from "@/lib/mock-data";

const LABELS: Record<Status, string> = {
  ok: "On target",
  warning: "Alert",
  critical: "Critical",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: Status;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        status === "ok" && "bg-status-ok-soft text-status-ok",
        status === "warning" && "bg-status-warning-soft text-status-warning",
        status === "critical" && "bg-status-critical-soft text-status-critical",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "ok" && "bg-status-ok",
          status === "warning" && "bg-status-warning",
          status === "critical" && "bg-status-critical",
        )}
      />
      {label ?? LABELS[status]}
    </span>
  );
}
