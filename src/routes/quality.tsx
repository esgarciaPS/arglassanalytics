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
import { useI18n } from "@/lib/i18n";
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
  const { p, td } = useI18n();
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
      month: td(MONTH_LABELS[i]!),
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
        title={p("qual.title")}
        description={p("qual.desc")}
        fileName="demo-quality"
        filterSummary={[
          `${p("qual.corrVariable")}: ${td(varLabel)}`,
          search ? `${p("common.search")}: "${search}"` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        sections={() => [
          {
            title: p("qual.secTrend"),
            columns: [p("common.month"), p("qual.colApproval"), p("qual.colRejection")],
            rows: rateTrend.map((r) => [r.month, r.approval, r.rejection]),
          },
          {
            title: p("qual.secCorrelation"),
            columns: [td(varLabel), p("qual.colDefectRatePct"), p("common.batch")],
            rows: scatter.map((pt) => [pt.x, pt.y, pt.batch]),
          },
          {
            title: p("qual.secInspections"),
            columns: [
              p("qual.colInspection"),
              p("common.batch"),
              p("common.line"),
              p("qual.colInspectionPoint"),
              p("qual.colProcessVariable"),
              p("common.value"),
              p("qual.colDefectRatePct"),
              p("common.result"),
              p("common.date"),
            ],
            rows: inspections.map((q) => [
              q.id,
              q.batchId,
              td(productionLines.find((l) => l.id === q.lineId)?.name ?? q.lineId),
              td(q.inspectionPoint),
              td(processVariables.find((v) => v.key === q.processVariable)?.label ?? ""),
              q.variableValue,
              q.defectRate,
              td(q.result),
              q.date,
            ]),
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title={p("qual.trendTitle")}
          subtitle={p("qual.trendSub", { n: approvedShare })}
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
                <Line type="monotone" dataKey="approval" name={p("qual.seriesApproval")} stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rejection" name={p("qual.seriesRejection")} stroke="var(--status-critical)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title={p("qual.scatterTitle")}
          subtitle={p("qual.scatterSub")}
          action={
            <Select value={variable} onValueChange={setVariable}>
              <SelectTrigger className="h-9 w-full sm:w-[260px]" aria-label={p("qual.colProcessVariable")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {processVariables.map((v) => (
                  <SelectItem key={v.key} value={v.key}>
                    {td(v.label)}
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
                  name={td(varLabel)}
                  domain={["dataMin", "dataMax"]}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={p("qual.colDefectRatePct")}
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
                <Scatter data={scatter} fill="var(--chart-2)" name={td(varLabel)} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6" title={p("qual.tableTitle")} subtitle={p("qual.tableSub", { n: inspections.length })}>
        <div className="max-h-[520px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{p("common.batch")}</TableHead>
                <TableHead>{p("common.line")}</TableHead>
                <TableHead>{p("qual.colInspectionPoint")}</TableHead>
                <TableHead>{p("qual.colProcessVariable")}</TableHead>
                <TableHead className="text-right">{p("common.value")}</TableHead>
                <TableHead className="text-right">{p("qual.colDefectRate")}</TableHead>
                <TableHead>{p("common.result")}</TableHead>
                <TableHead>{p("common.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.slice(0, 120).map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.batchId}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {td(productionLines.find((l) => l.id === q.lineId)?.name ?? "")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{td(q.inspectionPoint)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {td(processVariables.find((v) => v.key === q.processVariable)?.label ?? "")}
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
                      label={td(q.result)}
                    />
                  </TableCell>
                  <TableCell className="tabular text-muted-foreground">{q.date}</TableCell>
                </TableRow>
              ))}
              {inspections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {p("qual.empty")}
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
