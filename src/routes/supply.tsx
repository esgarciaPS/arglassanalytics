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
import {
  coverageDays,
  materialStatus,
  rawMaterials,
  stockHistory,
} from "@/lib/mock-data";

export const Route = createFileRoute("/supply")({
  head: () => ({
    meta: [
      { title: "Supply & Raw Materials — Arglass" },
      {
        name: "description",
        content:
          "Raw material stock levels, coverage targets, suppliers and warehouse status for glass container batch preparation.",
      },
      { property: "og:title", content: "Supply & Raw Materials — Arglass" },
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
    [warehouse, category, supplier, search],
  );

  const chartMaterials = filtered.slice(0, 5);

  return (
    <AppShell>
      <PageHeader
        title="Supply & Raw Materials"
        description="Batch house inventory position against minimum stock and coverage targets, by warehouse and supplier."
        fileName="arglass-supply"
        filterSummary={[
          warehouse !== ALL ? `Warehouse: ${warehouse}` : null,
          category !== ALL ? `Category: ${category}` : null,
          supplier !== ALL ? `Supplier: ${supplier}` : null,
          search ? `Search: "${search}"` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "No filters applied"}
        sections={() => [
          {
            title: "Raw materials",
            columns: [
              "ID",
              "Material",
              "Category",
              "Current stock",
              "Minimum stock",
              "Unit",
              "Coverage (days)",
              "Coverage target (days)",
              "Supplier",
              "Warehouse",
              "Status",
            ],
            rows: filtered.map((m) => [
              m.id,
              m.name,
              m.category,
              m.currentStock,
              m.minStock,
              m.unit,
              coverageDays(m),
              m.coverageTarget,
              m.supplier,
              m.warehouse,
              materialStatus(m),
            ]),
          },
        ]}
      >
        <FilterSelect value={warehouse} onChange={setWarehouse} options={warehouses} label="Warehouse" />
        <FilterSelect value={category} onChange={setCategory} options={categories} label="Category" />
        <FilterSelect value={supplier} onChange={setSupplier} options={suppliers} label="Supplier" />
      </PageHeader>

      <Panel
        title="Stock evolution by material"
        subtitle="Last 6 months — top materials in the current selection"
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
                  name={m.name}
                  stroke={`var(--chart-${(i % 5) + 1})`}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Raw material inventory" subtitle={`${filtered.length} material(s)`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current stock</TableHead>
                <TableHead className="text-right">Min. stock</TableHead>
                <TableHead className="text-right">Coverage</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.name}
                    <span className="ml-2 text-xs text-muted-foreground">{m.id}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.category}</TableCell>
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
                  <TableCell className="text-muted-foreground">{m.warehouse}</TableCell>
                  <TableCell>
                    <StatusBadge status={materialStatus(m)} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No materials match the current filters.
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
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[190px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}s</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
