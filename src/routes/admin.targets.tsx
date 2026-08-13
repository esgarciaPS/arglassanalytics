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
import { useI18n } from "@/lib/i18n";
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
  const { p, td } = useI18n();
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
        title={p("targets.title")}
        description={p("targets.desc")}
        fileName="demo-targets"
        filterSummary={search ? `${p("common.search")}: "${search}"` : p("common.noFilters")}
        sections={() => [
          {
            title: p("targets.secMat"),
            columns: [p("supply.colMaterial"), p("common.category"), p("supply.colCoverageTarget")],
            rows: materials.map((m) => [td(m.name), td(m.category), materialTargets[m.id] ?? 0]),
          },
          {
            title: p("targets.secLine"),
            columns: [p("common.line"), p("common.plant"), p("targets.colEffTarget")],
            rows: lines.map((l) => [td(l.name), td(l.plant), lineTargets[l.id] ?? 0]),
          },
          {
            title: p("targets.secChan"),
            columns: [p("common.channel"), p("targets.colMonthlyTarget")],
            rows: channels.map((c) => [td(c), channelTargets[c] ?? 0]),
          },
        ]}
      >
        <Button
          variant="secondary"
          onClick={() => toast.success(p("targets.saved"))}
        >
          {p("targets.save")}
        </Button>
      </PageHeader>

      <Tabs defaultValue="materials">
        <TabsList className="h-auto max-w-full flex-wrap justify-start">
          <TabsTrigger value="materials">{p("targets.tabMaterials")}</TabsTrigger>
          <TabsTrigger value="lines">{p("targets.tabLines")}</TabsTrigger>
          <TabsTrigger value="channels">{p("targets.tabChannels")}</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-4">
          <Panel title={p("targets.matTitle")} subtitle={p("targets.matSub")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{p("supply.colMaterial")}</TableHead>
                  <TableHead>{p("common.category")}</TableHead>
                  <TableHead className="text-right">{p("supply.colMinFull")}</TableHead>
                  <TableHead className="w-40 text-right">{p("supply.colCoverageTarget")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{td(m.name)}</TableCell>
                    <TableCell className="text-muted-foreground">{td(m.category)}</TableCell>
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
          <Panel title={p("targets.lineTitle")} subtitle={p("targets.lineSub")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{p("common.line")}</TableHead>
                  <TableHead>{p("common.plant")}</TableHead>
                  <TableHead className="w-40 text-right">{p("targets.colEffTarget")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{td(l.name)}</TableCell>
                    <TableCell className="text-muted-foreground">{td(l.plant)}</TableCell>
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
          <Panel title={p("targets.chanTitle")} subtitle={p("targets.chanSub")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{p("common.channel")}</TableHead>
                  <TableHead className="w-56 text-right">{p("targets.colMonthlyTarget")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((c) => (
                  <TableRow key={c}>
                    <TableCell className="font-medium">{td(c)}</TableCell>
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
  const { p } = useI18n();
  return (
    <div className="card-surface mx-auto mt-16 max-w-md p-8 text-center">
      <h1 className="font-display text-xl font-semibold text-foreground">
        {p("restricted.title")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {p("restricted.body")}
      </p>
    </div>
  );
}
