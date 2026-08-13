import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportExcel, exportPdf, type ExportSection } from "@/lib/export";
import { toast } from "sonner";
import { LegendPopover } from "@/components/dashboard/LegendPopover";
import { useI18n } from "@/lib/i18n";

export function PageHeader({
  title,
  description,
  fileName,
  sections,
  filterSummary,
  legendModule,
  children,
}: {
  title: string;
  description: string;
  fileName: string;
  sections: () => ExportSection[];
  filterSummary?: string;
  legendModule?: string;
  children?: React.ReactNode;
}) {
  const { p } = useI18n();
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto [&>*]:min-w-0">
        {children}
        {legendModule && <LegendPopover module={legendModule} />}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-2">
              <Download className="size-4" /> {p("common.export")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                exportExcel(fileName, sections());
                toast.success(p("common.toastExcel"));
              }}
            >
              <FileSpreadsheet className="mr-2 size-4" /> {p("common.excel")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                exportPdf(
                  fileName,
                  title,
                  filterSummary ?? p("common.noFilters"),
                  sections(),
                );
                toast.success(p("common.toastPdf"));
              }}
            >
              <FileText className="mr-2 size-4" /> {p("common.pdf")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={`card-surface p-5 ${className ?? ""}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
