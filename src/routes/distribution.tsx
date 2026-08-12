import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Panel } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matchesSearch, useApp } from "@/lib/app-context";
import { useI18n } from "@/lib/i18n";
import { MONTHS, MONTH_LABELS, salesTargets, type Status } from "@/lib/mock-data";

export const Route = createFileRoute("/distribution")({
  head: () => ({
    meta: [
      { title: "Distribution & Sales — DEMO" },
      {
        name: "description",
        content:
          "Available stock against projected demand, sales target attainment and channel performance for glass container distribution.",
      },
      { property: "og:title", content: "Distribution & Sales — DEMO" },
      {
        property: "og:description",
        content: "Demand coverage, sales target attainment and channel performance.",
      },
    ],
  }),
  component: DistributionPage,
});

const fmt = (n: number) => `${(n / 1_000_000).toFixed(2)}M`;

function channelStatus(ratio: number): Status {
  if (ratio >= 0.98) return "ok";
  if (ratio >= 0.9) return "warning";
  return "critical";
}

function DistributionPage() {
  const { search } = useApp();
  const { p, td } = useI18n();
  const [period, setPeriod] = useState(MONTHS[MONTHS.length - 1]!);

  const rows = useMemo(
    () =>
      salesTargets.filter(
        (s) =>
          s.period === period && matchesSearch(search, s.channel, s.region, s.period, s.id),
      ),
    [period, search],
  );

  const totalTarget = rows.reduce((a, s) => a + s.target, 0);
  const totalActual = rows.reduce((a, s) => a + s.actual, 0);
  const attainment = totalTarget ? (totalActual / totalTarget) * 100 : 0;

  const stockVsDemand = rows.map((s) => ({
    channel: td(s.channel),
    stock: s.availableStock,
    demand: s.projectedDemand,
  }));

  return (
    <AppShell>
      <PageHeader
        legendModule="distribution"
        title={p("dist.title")}
        description={p("dist.desc")}
        fileName="demo-distribution"
        filterSummary={[
          `${p("common.period")}: ${period}`,
          search ? `${p("common.search")}: "${search}"` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        sections={() => [
          {
            title: p("dist.secChannel"),
            columns: [
              p("common.period"),
              p("common.channel"),
              p("common.region"),
              p("dist.colTargetUnits"),
              p("dist.colActualUnits"),
              p("dist.colAttainmentPct"),
              p("dist.colAvailable"),
              p("dist.colDemand"),
            ],
            rows: rows.map((s) => [
              s.period,
              td(s.channel),
              td(s.region),
              s.target,
              s.actual,
              Math.round((s.actual / s.target) * 1000) / 10,
              s.availableStock,
              s.projectedDemand,
            ]),
          },
        ]}
      >
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-9 w-[160px]" aria-label={p("common.period")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={m}>
                {td(MONTH_LABELS[i]!)} {m.slice(0, 4)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title={p("dist.stockTitle")} subtitle={p("dist.stockSub", { p: period })}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockVsDemand} margin={{ top: 8, right: 8, left: 4, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="channel" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v: number) => fmt(v)} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number) => fmt(v)}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="stock" name={p("dist.seriesStock")} fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="demand" name={p("dist.seriesDemand")} fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={p("dist.attainTitle")} subtitle={p("dist.attainSub", { p: period })}>
          <div className="flex h-72 flex-col justify-center gap-6">
            <div>
              <p className="tabular font-display text-5xl font-semibold text-foreground">
                {attainment.toFixed(1)}
                <span className="text-2xl text-muted-foreground">%</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {p("dist.invoiced", { a: fmt(totalActual), t: fmt(totalTarget) })}
              </p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={
                  attainment >= 98
                    ? "h-full rounded-full bg-status-ok"
                    : attainment >= 90
                      ? "h-full rounded-full bg-status-warning"
                      : "h-full rounded-full bg-status-critical"
                }
                style={{ width: `${Math.min(100, attainment)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {p("dist.channelsTracked")}
                </p>
                <p className="tabular mt-1 font-display text-xl font-semibold">{rows.length}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {p("dist.demandCovered")}
                </p>
                <p className="tabular mt-1 font-display text-xl font-semibold">
                  {rows.length
                    ? Math.round(
                        (rows.reduce((a, s) => a + s.availableStock, 0) /
                          rows.reduce((a, s) => a + s.projectedDemand, 0)) *
                          100,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6" title={p("dist.tableTitle")} subtitle={p("dist.tableSub", { n: rows.length })}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{p("common.channel")}</TableHead>
                <TableHead>{p("common.region")}</TableHead>
                <TableHead className="text-right">{p("common.target")}</TableHead>
                <TableHead className="text-right">{p("common.actual")}</TableHead>
                <TableHead className="text-right">{p("dist.colAttainment")}</TableHead>
                <TableHead className="text-right">{p("dist.colAvailable")}</TableHead>
                <TableHead className="text-right">{p("dist.colDemand")}</TableHead>
                <TableHead>{p("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const ratio = s.actual / s.target;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{td(s.channel)}</TableCell>
                    <TableCell className="text-muted-foreground">{td(s.region)}</TableCell>
                    <TableCell className="tabular text-right text-muted-foreground">{fmt(s.target)}</TableCell>
                    <TableCell className="tabular text-right">{fmt(s.actual)}</TableCell>
                    <TableCell className="tabular text-right">{(ratio * 100).toFixed(1)}%</TableCell>
                    <TableCell className="tabular text-right text-muted-foreground">{fmt(s.availableStock)}</TableCell>
                    <TableCell className="tabular text-right text-muted-foreground">{fmt(s.projectedDemand)}</TableCell>
                    <TableCell>
                      <StatusBadge status={channelStatus(ratio)} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {p("dist.empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </AppShell>
  );
}
