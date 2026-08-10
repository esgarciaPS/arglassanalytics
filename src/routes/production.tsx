import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
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
import {
  MONTHS,
  MONTH_LABELS,
  batchProduct,
  downtimeCauses,
  productionBatches,
  productionLines,
  type Status,
} from "@/lib/mock-data";

export const Route = createFileRoute("/production")({
  head: () => ({
    meta: [
      { title: "Production — Arglass Operations Analytics" },
      {
        name: "description",
        content:
          "Line efficiency against target, downtime pareto by root cause and produced batch performance across furnace lines.",
      },
      { property: "og:title", content: "Production — Arglass Operations Analytics" },
      {
        property: "og:description",
        content: "Furnace line efficiency, downtime causes and batch output vs. target.",
      },
    ],
  }),
  component: ProductionPage,
});

const TARGET_EFFICIENCY = 92;

function batchStatus(b: { producedQty: number; targetQty: number }): Status {
  const r = b.producedQty / b.targetQty;
  if (r >= 0.95) return "ok";
  if (r >= 0.87) return "warning";
  return "critical";
}

function ProductionPage() {
  const { search } = useApp();
  const [lineId, setLineId] = useState("all");

  const batches = useMemo(
    () =>
      productionBatches.filter(
        (b) =>
          (lineId === "all" || b.lineId === lineId) &&
          matchesSearch(
            search,
            b.id,
            b.date,
            batchProduct(b.id),
            productionLines.find((l) => l.id === b.lineId)?.name ?? "",
            productionLines.find((l) => l.id === b.lineId)?.plant ?? "",
          ),
      ),
    [lineId, search],
  );

  const efficiencyByMonth = MONTHS.map((m, i) => {
    const row: Record<string, string | number> = { month: MONTH_LABELS[i]!, target: TARGET_EFFICIENCY };
    productionLines.forEach((l) => {
      const set = batches.filter((b) => b.lineId === l.id && b.date.startsWith(m));
      row[l.id] = set.length
        ? Math.round((set.reduce((a, b) => a + b.efficiency, 0) / set.length) * 10) / 10
        : 0;
    });
    return row;
  });

  const pareto = useMemo(() => {
    const causes = downtimeCauses.filter((c) => lineId === "all" || c.lineId === lineId);
    const total = causes.reduce((a, c) => a + c.minutes, 0) || 1;
    let cum = 0;
    return [...causes]
      .sort((a, b) => b.minutes - a.minutes)
      .map((c) => {
        cum += c.minutes;
        return {
          cause: c.cause,
          minutes: c.minutes,
          cumulative: Math.round((cum / total) * 1000) / 10,
        };
      });
  }, [lineId]);

  return (
    <AppShell>
      <PageHeader
        title="Production"
        description="Forming and cold-end performance by furnace line: efficiency against target, downtime drivers and batch output."
        fileName="arglass-production"
        filterSummary={[
          lineId === "all"
            ? "All lines"
            : `Line: ${productionLines.find((l) => l.id === lineId)?.name}`,
          search ? `Search: "${search}"` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        sections={() => [
          {
            title: "Efficiency vs target",
            columns: ["Month", ...productionLines.map((l) => l.name), "Target (%)"],
            rows: efficiencyByMonth.map((r) => [
              r["month"] as string,
              ...productionLines.map((l) => r[l.id] as number),
              TARGET_EFFICIENCY,
            ]),
          },
          {
            title: "Downtime pareto",
            columns: ["Cause", "Downtime (min)", "Cumulative (%)"],
            rows: pareto.map((p) => [p.cause, p.minutes, p.cumulative]),
          },
          {
            title: "Batches",
            columns: [
              "Batch",
              "Line",
              "Product",
              "Date",
              "Produced (un)",
              "Target (un)",
              "Efficiency (%)",
              "Downtime (min)",
              "Status",
            ],
            rows: batches.map((b) => [
              b.id,
              productionLines.find((l) => l.id === b.lineId)?.name ?? b.lineId,
              batchProduct(b.id),
              b.date,
              b.producedQty,
              b.targetQty,
              b.efficiency,
              b.downtimeMin,
              batchStatus(b),
            ]),
          },
        ]}
      >
        <Select value={lineId} onValueChange={setLineId}>
          <SelectTrigger className="h-9 w-[260px]" aria-label="Production line">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All lines — all plants</SelectItem>
            {productionLines.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name} · {l.plant}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Line efficiency vs. target" subtitle="Monthly average, last 6 months">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={efficiencyByMonth} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {productionLines
                  .filter((l) => lineId === "all" || l.id === lineId)
                  .map((l, i) => (
                    <Bar key={l.id} dataKey={l.id} name={l.name} fill={`var(--chart-${i + 1})`} radius={[3, 3, 0, 0]} />
                  ))}
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target %"
                  stroke="var(--status-critical)"
                  strokeDasharray="5 4"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Downtime pareto" subtitle="Accumulated minutes by root cause">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pareto} margin={{ top: 8, right: 8, left: -12, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="cause"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar yAxisId="left" dataKey="minutes" name="Downtime (min)" radius={[3, 3, 0, 0]}>
                  {pareto.map((p, i) => (
                    <Cell key={p.cause} fill={i < 2 ? "var(--status-critical)" : "var(--chart-1)"} />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative %"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6" title="Produced batches" subtitle={`${batches.length} batch record(s)`}>
        <div className="max-h-[520px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Produced</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Efficiency</TableHead>
                <TableHead className="text-right">Downtime</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {productionLines.find((l) => l.id === b.lineId)?.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{batchProduct(b.id)}</TableCell>
                  <TableCell className="tabular text-muted-foreground">{b.date}</TableCell>
                  <TableCell className="tabular text-right">{b.producedQty.toLocaleString()}</TableCell>
                  <TableCell className="tabular text-right text-muted-foreground">
                    {b.targetQty.toLocaleString()}
                  </TableCell>
                  <TableCell className="tabular text-right">{b.efficiency}%</TableCell>
                  <TableCell className="tabular text-right text-muted-foreground">{b.downtimeMin} min</TableCell>
                  <TableCell>
                    <StatusBadge status={batchStatus(b)} />
                  </TableCell>
                </TableRow>
              ))}
              {batches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No batches match the current filters.
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
