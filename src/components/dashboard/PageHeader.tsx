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

export function PageHeader({
  title,
  description,
  fileName,
  sections,
  filterSummary,
  children,
}: {
  title: string;
  description: string;
  fileName: string;
  sections: () => ExportSection[];
  filterSummary?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-2">
              <Download className="size-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                exportExcel(fileName, sections());
                toast.success("Excel report generated from the current view");
              }}
            >
              <FileSpreadsheet className="mr-2 size-4" /> Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                exportPdf(
                  fileName,
                  title,
                  filterSummary ?? "All records — no filters applied",
                  sections(),
                );
                toast.success("PDF report generated from the current view");
              }}
            >
              <FileText className="mr-2 size-4" /> Export to PDF
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
