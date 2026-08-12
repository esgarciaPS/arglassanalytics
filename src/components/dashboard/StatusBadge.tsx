import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Status } from "@/lib/mock-data";

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: Status;
  label?: string;
  className?: string;
}) {
  const { p } = useI18n();
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
      {label ?? p(`status.${status}`)}
    </span>
  );
}
