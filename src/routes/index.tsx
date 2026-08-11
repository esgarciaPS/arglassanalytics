import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Boxes, Gauge, ShieldCheck, Truck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader, Panel } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { matchesSearch, useApp } from "@/lib/app-context";
import { alerts, executiveKpis, monthlyTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Panel — DEMO Operations Analytics" },
      {
        name: "description",
        content:
          "Consolidated glass container manufacturing KPIs: production compliance, stock coverage, positive release and sales fulfillment.",
      },
      { property: "og:title", content: "Executive Panel — DEMO Operations Analytics" },
      {
        property: "og:description",
        content:
          "Consolidated manufacturing KPIs across supply, production, quality and distribution.",
      },
    ],
  }),
  component: ExecutivePage,
});

function ExecutivePage() {
  const { search } = useApp();
  const kpi = executiveKpis();
  const trend = monthlyTrend();
  const visibleAlerts = alerts.filter((a) =>
    matchesSearch(search, a.message, a.domain, a.severity),
  );

  return (
    <AppShell>
      <PageHeader
        legendModule="executive"
        title="Executive Panel"
        description="Consolidated view of supply, production, quality and commercial performance for the last six months."
        fileName="demo-executive-panel"
        filterSummary={search ? `Search filter: "${search}"` : "No filters applied"}
        sections={() => [
          {
            title: "Consolidated trend",
            columns: [
              "Month",
              "Production compliance (%)",
              "Positive release (%)",
              "Sales fulfillment (%)",
            ],
            rows: trend.map((t) => [t.month, t.production, t.quality, t.sales]),
          },
          {
            title: "Alerts",
            columns: ["Severity", "Domain", "Message", "Timestamp"],
            rows: visibleAlerts.map((a) => [
              a.severity,
              a.domain,
              a.message,
              a.timestamp,
            ]),
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Production compliance"
          value={kpi.production.value}
          unit="%"
          delta={kpi.production.delta}
          caption="vs. previous month"
          icon={Gauge}
          status={kpi.production.value >= 95 ? "ok" : "warning"}
        />
        <KpiCard
          label="Stock coverage"
          value={kpi.coverage.value}
          unit="days"
          delta={kpi.coverage.delta}
          caption="weighted average"
          icon={Boxes}
          status={kpi.coverage.value >= 15 ? "ok" : "warning"}
        />
        <KpiCard
          label="Sales capacity covered"
          value={kpi.sales.value}
          unit="%"
          delta={kpi.sales.delta}
          caption="vs. previous month"
          icon={Truck}
          status={kpi.sales.value >= 95 ? "ok" : "warning"}
        />
        <KpiCard
          label="Positive release"
          value={kpi.quality.value}
          unit="%"
          delta={kpi.quality.delta}
          caption="approved inspections"
          icon={ShieldCheck}
          status={kpi.quality.value >= 90 ? "ok" : "warning"}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Consolidated performance trend"
          subtitle="Production compliance, positive release and sales fulfillment — last 6 months"
        >
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 110]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="production"
                  name="Production compliance %"
                  stroke="var(--chart-1)"
                  fill="url(#gProd)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="quality"
                  name="Positive release %"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales fulfillment %"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Recent alerts & deviations"
          subtitle={`${visibleAlerts.length} record(s) in the current view`}
        >
          <ul className="space-y-3">
            {visibleAlerts.map((a) => (
              <li
                key={a.id}
                className="rounded-md border border-border bg-muted/40 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge
                    status={a.severity}
                    label={
                      a.severity === "ok"
                        ? "Resolved"
                        : a.severity === "warning"
                          ? "Alert"
                          : "Critical"
                    }
                  />
                  <span className="text-[11px] text-muted-foreground">{a.timestamp}</span>
                </div>
                <p className="mt-2 text-sm text-foreground">{a.message}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {a.domain}
                </p>
              </li>
            ))}
            {visibleAlerts.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No alerts match the current search.
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
