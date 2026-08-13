import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import { useTargets } from "@/lib/targets-store";
import {
  coverageDays,
  materialStatus,
  rawMaterials,
  stockHistory,
} from "@/lib/mock-data";

export const Route = createFileRoute("/supply")({
  head: () => ({
    meta: [
      { title: "Supply & Raw Materials — DEMO" },
      {
        name: "description",
        content:
          "Raw material stock levels, coverage targets, suppliers and warehouse status for glass container batch preparation.",
      },
      { property: "og:title", content: "Supply & Raw Materials — DEMO" },
      {
        property: "og:description",
        content: "Stock coverage, minimum thresholds and supplier performance by material.",
      },
    ],
  }),
  component: SupplyPage,
});

const ALL = "all";

function SupplyPage() {
  const { search } = useApp();
  const { p, td } = useI18n();
  const { version } = useTargets();
  const [warehouse, setWarehouse] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [supplier, setSupplier] = useState(ALL);

  const warehouses = [...new Set(rawMaterials.map((m) => m.warehouse))];
  const categories = [...new Set(rawMaterials.map((m) => m.category))];
  const suppliers = [...new Set(rawMaterials.map((m) => m.supplier))];

  const filtered = useMemo(
    () =>
      rawMaterials.filter(
        (m) =>
          (warehouse === ALL || m.warehouse === warehouse) &&
          (category === ALL || m.category === category) &&
          (supplier === ALL || m.supplier === supplier) &&
          matchesSearch(search, m.name, m.category, m.supplier, m.warehouse, m.id),
      ),
    [warehouse, category, supplier, search, version],
  );

  const chartMaterials = filtered.slice(0, 5);

  return (
    <AppShell>
      <PageHeader
        legendModule="supply"
        title={p("supply.title")}
        description={p("supply.desc")}
        fileName="demo-supply"
        filterSummary={[
          warehouse !== ALL ? `${p("common.warehouse")}: ${td(warehouse)}` : null,
          category !== ALL ? `${p("common.category")}: ${td(category)}` : null,
          supplier !== ALL ? `${p("common.supplier")}: ${supplier}` : null,
          search ? `${p("common.search")}: "${search}"` : null,
        ]
          .filter(Boolean)
          .join(" · ") || p("common.noFilters")}
        sections={() => [
          {
            title: p("supply.secMaterials"),
            columns: [
              "ID",
              p("supply.colMaterial"),
              p("common.category"),
              p("supply.colCurrent"),
              p("supply.colMinFull"),
              p("supply.colUnit"),
              p("supply.colCoverageDays"),
              p("supply.colCoverageTarget"),
              p("common.supplier"),
              p("common.warehouse"),
              p("common.status"),
            ],
            rows: filtered.map((m) => [
              m.id,
              td(m.name),
              td(m.category),
              m.currentStock,
              m.minStock,
              m.unit,
              coverageDays(m),
              m.coverageTarget,
              m.supplier,
              td(m.warehouse),
              p(`status.${materialStatus(m)}`),
            ]),
          },
        ]}
      >
        <FilterSelect value={warehouse} onChange={setWarehouse} options={warehouses} label={p("common.warehouse")} allLabel={p("supply.allWarehouses")} />
        <FilterSelect value={category} onChange={setCategory} options={categories} label={p("common.category")} allLabel={p("supply.allCategories")} />
        <FilterSelect value={supplier} onChange={setSupplier} options={suppliers} label={p("common.supplier")} allLabel={p("supply.allSuppliers")} />
      </PageHeader>

      <Panel
        title={p("supply.chartTitle")}
        subtitle={p("supply.chartSub")}
        className="mb-6"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stockHistory} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
              {chartMaterials.map((m, i) => (
                <Line
                  key={m.id}
                  type="monotone"
                  dataKey={m.id}
                  name={td(m.name)}
                  stroke={`var(--chart-${(i % 5) + 1})`}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title={p("supply.tableTitle")} subtitle={p("supply.tableSub", { n: filtered.length })}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{p("supply.colMaterial")}</TableHead>
                <TableHead>{p("common.category")}</TableHead>
                <TableHead className="text-right">{p("supply.colCurrent")}</TableHead>
                <TableHead className="text-right">{p("supply.colMin")}</TableHead>
                <TableHead className="text-right">{p("supply.colCoverage")}</TableHead>
                <TableHead className="text-right">{p("common.target")}</TableHead>
                <TableHead>{p("common.supplier")}</TableHead>
                <TableHead>{p("common.warehouse")}</TableHead>
                <TableHead>{p("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {td(m.name)}
                    <span className="ml-2 text-xs text-muted-foreground">{m.id}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{td(m.category)}</TableCell>
                  <TableCell className="tabular text-right">
                    {m.currentStock.toLocaleString()} {m.unit}
                  </TableCell>
                  <TableCell className="tabular text-right text-muted-foreground">
                    {m.minStock.toLocaleString()} {m.unit}
                  </TableCell>
                  <TableCell className="tabular text-right">{coverageDays(m)} d</TableCell>
                  <TableCell className="tabular text-right text-muted-foreground">
                    {m.coverageTarget} d
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.supplier}</TableCell>
                  <TableCell className="text-muted-foreground">{td(m.warehouse)}</TableCell>
                  <TableCell>
                    <StatusBadge status={materialStatus(m)} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    {p("supply.empty")}
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

function FilterSelect({
  value,
  onChange,
  options,
  label,
  allLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
  allLabel: string;
}) {
  const { td } = useI18n();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full sm:w-[190px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {td(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
