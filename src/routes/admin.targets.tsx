import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Panel } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { matchesSearch, useApp } from "@/lib/app-context";
import { rawMaterials, productionLines, salesTargets, MONTHS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/targets")({
  head: () => ({
    meta: [
      { title: "Target Configuration — DEMO Administration" },
      {
        name: "description",
        content:
          "Define coverage targets by raw material, efficiency targets by production line and sales targets by distribution channel.",
      },
      { property: "og:title", content: "Target Configuration — DEMO Administration" },
      {
        property: "og:description",
        content: "Administrative configuration of operational and commercial targets.",
      },
    ],
  }),
  component: TargetsPage,
});

const LINE_DEFAULTS: Record<string, number> = { L1: 92, L2: 92, L3: 90 };

function TargetsPage() {
  const { search, session } = useApp();
  const [materialTargets, setMaterialTargets] = useState<Record<string, number>>(
    Object.fromEntries(rawMaterials.map((m) => [m.id, m.coverageTarget])),
  );
  const [lineTargets, setLineTargets] = useState<Record<string, number>>(LINE_DEFAULTS);
  const [channelTargets, setChannelTargets] = useState<Record<string, number>>(() => {
    const last = MONTHS[MONTHS.length - 1]!;
    return Object.fromEntries(
      salesTargets.filter((s) => s.period === last).map((s) => [s.channel, s.target]),
    );
  });

  const materials = useMemo(
    () => rawMaterials.filter((m) => matchesSearch(search, m.name, m.category, m.id)),
    [search],
  );
  const lines = useMemo(
    () => productionLines.filter((l) => matchesSearch(search, l.name, l.plant, l.id)),
    [search],
  );
  const channels = useMemo(
    () => Object.keys(channelTargets).filter((c) => matchesSearch(search, c)),
    [channelTargets, search],
  );

  if (session?.role !== "Administrator") {
    return (
      <AppShell>
        <RestrictedNotice />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        legendModule="targets"
        title="Target Configuration"
        description="Set the operational and commercial thresholds that drive status badges and compliance indicators across the platform."
        fileName="demo-targets"
        filterSummary={search ? `Search: "${search}"` : "No filters applied"}
        sections={() => [
          {
            title: "Material coverage targets",
            columns: ["Material", "Category", "Coverage target (days)"],
            rows: materials.map((m) => [m.name, m.category, materialTargets[m.id] ?? 0]),
          },
          {
            title: "Line efficiency targets",
            columns: ["Line", "Plant", "Efficiency target (%)"],
            rows: lines.map((l) => [l.name, l.plant, lineTargets[l.id] ?? 0]),
          },
          {
            title: "Channel sales targets",
            columns: ["Channel", "Monthly target (units)"],
            rows: channels.map((c) => [c, channelTargets[c] ?? 0]),
          },
        ]}
      >
        <Button
          variant="secondary"
          onClick={() => toast.success("Target configuration saved (demo environment)")}
        >
          Save changes
        </Button>
      </PageHeader>

      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">Raw materials</TabsTrigger>
          <TabsTrigger value="lines">Production lines</TabsTrigger>
          <TabsTrigger value="channels">Distribution channels</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-4">
          <Panel title="Coverage target by raw material" subtitle="Expressed in days of consumption">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Minimum stock</TableHead>
                  <TableHead className="w-40 text-right">Coverage target (days)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.category}</TableCell>
                    <TableCell className="tabular text-right text-muted-foreground">
                      {m.minStock.toLocaleString()} {m.unit}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="tabular h-9 text-right"
                        value={materialTargets[m.id] ?? 0}
                        onChange={(e) =>
                          setMaterialTargets((prev) => ({
                            ...prev,
                            [m.id]: Number(e.target.value),
                          }))
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="lines" className="mt-4">
          <Panel title="Efficiency target by production line" subtitle="Monthly average, in percent">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead className="w-40 text-right">Efficiency target (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-muted-foreground">{l.plant}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="tabular h-9 text-right"
                        value={lineTargets[l.id] ?? 0}
                        onChange={(e) =>
                          setLineTargets((prev) => ({ ...prev, [l.id]: Number(e.target.value) }))
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <Panel title="Monthly sales target by channel" subtitle="Units of finished product">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="w-56 text-right">Monthly target (units)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((c) => (
                  <TableRow key={c}>
                    <TableCell className="font-medium">{c}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="tabular h-9 text-right"
                        value={channelTargets[c] ?? 0}
                        onChange={(e) =>
                          setChannelTargets((prev) => ({ ...prev, [c]: Number(e.target.value) }))
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

export function RestrictedNotice() {
  return (
    <div className="card-surface mx-auto mt-16 max-w-md p-8 text-center">
      <h1 className="font-display text-xl font-semibold text-foreground">
        Restricted module
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Administration is available to the Administrator role only. Sign in with an
        administrator account to manage targets, users and roles.
      </p>
    </div>
  );
}
