import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
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
  processVariables,
  productionLines,
  qualityInspections,
} from "@/lib/mock-data";

export const Route = createFileRoute("/quality")({
  head: () => ({
    meta: [
      { title: "Quality & Positive Release — DEMO" },
      {
        name: "description",
        content:
          "Approval and rejection rates over time, process variable correlation with defect rate, and inspection traceability by batch.",
      },
      { property: "og:title", content: "Quality & Positive Release — DEMO" },
      {
        property: "og:description",
        content: "Positive release rates, defect correlation analysis and inspection records.",
      },
    ],
  }),
  component: QualityPage,
});

function QualityPage() {
  const { search } = useApp();
  const [variable, setVariable] = useState(processVariables[0]!.key);

  const inspections = useMemo(
    () =>
      qualityInspections.filter((q) =>
        matchesSearch(
          search,
          q.id,
          q.batchId,
          q.inspectionPoint,
          q.result,
          q.date,
          productionLines.find((l) => l.id === q.lineId)?.name ?? "",
        ),
      ),
    [search],
  );

  const rateTrend = MONTHS.map((m, i) => {
    const set = inspections.filter((q) => q.date.startsWith(m));
    const approved = set.filter((q) => q.result === "Approved").length;
    const rejected = set.filter((q) => q.result === "Rejected").length;
    return {
      month: MONTH_LABELS[i]!,
      approval: set.length ? Math.round((approved / set.length) * 1000) / 10 : 0,
      rejection: set.length ? Math.round((rejected / set.length) * 1000) / 10 : 0,
    };
  });

  const scatter = inspections
    .filter((q) => q.processVariable === variable)
    .map((q) => ({ x: q.variableValue, y: q.defectRate, batch: q.batchId }));

  const varLabel = processVariables.find((v) => v.key === variable)?.label ?? variable;

  const approvedShare = inspections.length
    ? Math.round(
        (inspections.filter((q) => q.result === "Approved").length / inspections.length) *
          1000,
      ) / 10
    : 0;

  return (
    <AppShell>
      <PageHeader
        legendModule="quality"
        title="Quality & Positive Release"
        description="Release decisions, defect drivers and inspection traceability across hot end, cold end and laboratory checkpoints."
        fileName="demo-quality"
        filterSummary={[
          `Correlation variable: ${varLabel}`,
          search ? `Search: "${search}"` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        sections={() => [
          {
            title: "Approval trend",
            columns: ["Month", "Approval rate (%)", "Rejection rate (%)"],
            rows: rateTrend.map((r) => [r.month, r.approval, r.rejection]),
          },
          {
            title: "Correlation data",
            columns: [varLabel, "Defect rate (%)", "Batch"],
            rows: scatter.map((p) => [p.x, p.y, p.batch]),
          },
          {
            title: "Inspections",
            columns: [
              "Inspection",
              "Batch",
              "Line",
              "Inspection point",
              "Process variable",
              "Value",
              "Defect rate (%)",
              "Result",
              "Date",
            ],
            rows: inspections.map((q) => [
              q.id,
              q.batchId,
              productionLines.find((l) => l.id === q.lineId)?.name ?? q.lineId,
              q.inspectionPoint,
              processVariables.find((v) => v.key === q.processVariable)?.label ?? "",
              q.variableValue,
              q.defectRate,
              q.result,
              q.date,
            ]),
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Approval vs. rejection rate"
          subtitle={`Positive release at ${approvedShare}% across the current selection`}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rateTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="approval" name="Approval %" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rejection" name="Rejection %" stroke="var(--status-critical)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Process variable vs. defect rate"
          subtitle="Each point is an inspection record"
          action={
            <Select value={variable} onValueChange={setVariable}>
              <SelectTrigger className="h-9 w-[260px]" aria-label="Process variable">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {processVariables.map((v) => (
                  <SelectItem key={v.key} value={v.key}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={varLabel}
                  domain={["dataMin", "dataMax"]}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Defect rate %"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ZAxis range={[45, 45]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Scatter data={scatter} fill="var(--chart-2)" name={varLabel} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6" title="Inspection records" subtitle={`${inspections.length} inspection(s)`}>
        <div className="max-h-[520px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Inspection point</TableHead>
                <TableHead>Process variable</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Defect rate</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.slice(0, 120).map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.batchId}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {productionLines.find((l) => l.id === q.lineId)?.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{q.inspectionPoint}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {processVariables.find((v) => v.key === q.processVariable)?.label}
                  </TableCell>
                  <TableCell className="tabular text-right">{q.variableValue}</TableCell>
                  <TableCell className="tabular text-right">{q.defectRate}%</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        q.result === "Approved"
                          ? "ok"
                          : q.result === "Conditional"
                            ? "warning"
                            : "critical"
                      }
                      label={q.result}
                    />
                  </TableCell>
                  <TableCell className="tabular text-muted-foreground">{q.date}</TableCell>
                </TableRow>
              ))}
              {inspections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No inspections match the current search.
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
