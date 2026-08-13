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
import { useI18n } from "@/lib/i18n";
import { useTargets } from "@/lib/targets-store";
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
  const { p, td } = useI18n();
  useTargets();
  const kpi = executiveKpis();
  const trend = monthlyTrend().map((t) => ({ ...t, month: td(t.month) }));
  const visibleAlerts = alerts.filter((a) =>
    matchesSearch(search, a.message, a.domain, a.severity),
  );

  return (
    <AppShell>
      <PageHeader
        legendModule="executive"
        title={p("exec.title")}
        description={p("exec.desc")}
        fileName="demo-executive-panel"
        filterSummary={search ? `${p("exec.searchFilter")}: "${search}"` : p("common.noFilters")}
        sections={() => [
          {
            title: p("exec.secTrend"),
            columns: [
              p("common.month"),
              p("exec.colProduction"),
              p("exec.colQuality"),
              p("exec.colSales"),
            ],
            rows: trend.map((t) => [t.month, t.production, t.quality, t.sales]),
          },
          {
            title: p("exec.secAlerts"),
            columns: [
              p("exec.colSeverity"),
              p("exec.colDomain"),
              p("exec.colMessage"),
              p("exec.colTimestamp"),
            ],
            rows: visibleAlerts.map((a) => [
              p(`status.${a.severity}`),
              td(a.domain),
              td(a.message),
              a.timestamp,
            ]),
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={p("exec.kpiProduction")}
          value={kpi.production.value}
          unit="%"
          delta={kpi.production.delta}
          caption={p("exec.vsPrev")}
          icon={Gauge}
          status={kpi.production.value >= 95 ? "ok" : "warning"}
        />
        <KpiCard
          label={p("exec.kpiCoverage")}
          value={kpi.coverage.value}
          unit={p("common.days")}
          delta={kpi.coverage.delta}
          caption={p("exec.weighted")}
          icon={Boxes}
          status={kpi.coverage.value >= 15 ? "ok" : "warning"}
        />
        <KpiCard
          label={p("exec.kpiSales")}
          value={kpi.sales.value}
          unit="%"
          delta={kpi.sales.delta}
          caption={p("exec.vsPrev")}
          icon={Truck}
          status={kpi.sales.value >= 95 ? "ok" : "warning"}
        />
        <KpiCard
          label={p("exec.kpiQuality")}
          value={kpi.quality.value}
          unit="%"
          delta={kpi.quality.delta}
          caption={p("exec.approvedInspections")}
          icon={ShieldCheck}
          status={kpi.quality.value >= 90 ? "ok" : "warning"}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title={p("exec.trendTitle")}
          subtitle={p("exec.trendSub")}
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
                  name={p("exec.seriesProduction")}
                  stroke="var(--chart-1)"
                  fill="url(#gProd)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="quality"
                  name={p("exec.seriesQuality")}
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name={p("exec.seriesSales")}
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title={p("exec.alertsTitle")}
          subtitle={p("exec.alertsSub", { n: visibleAlerts.length })}
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
                        ? p("exec.badgeResolved")
                        : a.severity === "warning"
                          ? p("exec.badgeAlert")
                          : p("exec.badgeCritical")
                    }
                  />
                  <span className="text-[11px] text-muted-foreground">{a.timestamp}</span>
                </div>
                <p className="mt-2 text-sm text-foreground">{td(a.message)}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {td(a.domain)}
                </p>
              </li>
            ))}
            {visibleAlerts.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                {p("exec.noAlerts")}
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
