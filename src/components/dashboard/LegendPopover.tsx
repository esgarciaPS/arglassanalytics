import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";

export function LegendPopover({ module }: { module: string }) {
  const { d, t } = useI18n();
  const items = d.legends[module] ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Info className="size-4" /> {t("ui.legend")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[26rem] max-w-[90vw] p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{t("ui.legendTitle")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("ui.legendSubtitle")}</p>
        </div>
        <ul className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
          {items.map((item) => (
            <li key={item.term}>
              <p className="text-xs font-semibold text-foreground">{item.term}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
