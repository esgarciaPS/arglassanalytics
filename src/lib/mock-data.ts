// Deterministic mock dataset for the DEMO operations analytics platform.
// All values are synthetic but shaped to look realistic to a technical audience.

export type Status = "ok" | "warning" | "critical";

export interface RawMaterial {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  coverageTarget: number; // days
  supplier: string;
  warehouse: string;
  unit: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  plant: string;
}

export interface ProductionBatch {
  id: string;
  lineId: string;
  date: string;
  producedQty: number;
  targetQty: number;
  efficiency: number;
  downtimeMin: number;
}

export interface QualityInspection {
  id: string;
  batchId: string;
  lineId: string;
  inspectionPoint: string;
  processVariable: string;
  variableValue: number;
  defectRate: number;
  result: "Approved" | "Rejected" | "Conditional";
  date: string;
}

export interface SalesTarget {
  id: string;
  period: string;
  channel: string;
  region: string;
  target: number;
  actual: number;
  availableStock: number;
  projectedDemand: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Suspended";
}

export type Role =
  | "Administrator"
  | "Production Supervisor"
  | "Quality Analyst"
  | "Executive";

export const MONTHS = [
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
];

export const MONTH_LABELS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];

// Simple deterministic pseudo-random generator so charts stay stable per render.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export const productionLines: ProductionLine[] = [
  { id: "L1", name: "Furnace Line A — Flint", plant: "Valdosta Plant 1" },
  { id: "L2", name: "Furnace Line B — Amber", plant: "Valdosta Plant 1" },
  { id: "L3", name: "Furnace Line C — Green", plant: "Valdosta Plant 2" },
];

export const rawMaterials: RawMaterial[] = [
  {
    id: "RM-001",
    name: "Silica Sand",
    category: "Vitrifier",
    currentStock: 4820,
    minStock: 3000,
    coverageTarget: 21,
    supplier: "Southern Minerals Co.",
    warehouse: "Silo Yard A",
    unit: "t",
  },
  {
    id: "RM-002",
    name: "Soda Ash (Dense)",
    category: "Flux",
    currentStock: 1180,
    minStock: 1200,
    coverageTarget: 18,
    supplier: "Ciner Resources",
    warehouse: "Silo Yard A",
    unit: "t",
  },
  {
    id: "RM-003",
    name: "Limestone",
    category: "Stabilizer",
    currentStock: 2140,
    minStock: 1500,
    coverageTarget: 20,
    supplier: "Georgia Aggregates",
    warehouse: "Silo Yard B",
    unit: "t",
  },
  {
    id: "RM-004",
    name: "Dolomite",
    category: "Stabilizer",
    currentStock: 640,
    minStock: 900,
    coverageTarget: 15,
    supplier: "Georgia Aggregates",
    warehouse: "Silo Yard B",
    unit: "t",
  },
  {
    id: "RM-005",
    name: "Feldspar",
    category: "Stabilizer",
    currentStock: 910,
    minStock: 700,
    coverageTarget: 16,
    supplier: "Imerys Ceramics",
    warehouse: "Warehouse 3",
    unit: "t",
  },
  {
    id: "RM-006",
    name: "External Cullet — Flint",
    category: "Cullet",
    currentStock: 3260,
    minStock: 2500,
    coverageTarget: 12,
    supplier: "Strategic Materials",
    warehouse: "Cullet Pad",
    unit: "t",
  },
  {
    id: "RM-007",
    name: "External Cullet — Amber",
    category: "Cullet",
    currentStock: 1420,
    minStock: 1600,
    coverageTarget: 12,
    supplier: "Strategic Materials",
    warehouse: "Cullet Pad",
    unit: "t",
  },
  {
    id: "RM-008",
    name: "Sodium Sulfate",
    category: "Refining Agent",
    currentStock: 118,
    minStock: 60,
    coverageTarget: 25,
    supplier: "Nordic Chem",
    warehouse: "Warehouse 3",
    unit: "t",
  },
  {
    id: "RM-009",
    name: "Iron Chromite",
    category: "Colorant",
    currentStock: 38,
    minStock: 45,
    coverageTarget: 30,
    supplier: "Colorobbia",
    warehouse: "Warehouse 3",
    unit: "t",
  },
  {
    id: "RM-010",
    name: "Cold-End Coating (PE Wax)",
    category: "Coating",
    currentStock: 24,
    minStock: 12,
    coverageTarget: 28,
    supplier: "Arkema Specialty",
    warehouse: "Warehouse 4",
    unit: "t",
  },
  {
    id: "RM-011",
    name: "Corrugated Partitions",
    category: "Packaging",
    currentStock: 96000,
    minStock: 60000,
    coverageTarget: 22,
    supplier: "Packwell Inc.",
    warehouse: "Warehouse 4",
    unit: "un",
  },
  {
    id: "RM-012",
    name: "Stretch Film",
    category: "Packaging",
    currentStock: 18,
    minStock: 26,
    coverageTarget: 20,
    supplier: "Packwell Inc.",
    warehouse: "Warehouse 4",
    unit: "t",
  },
];

export function materialStatus(m: RawMaterial): Status {
  const ratio = m.currentStock / m.minStock;
  if (ratio < 0.85) return "critical";
  if (ratio < 1.15) return "warning";
  return "ok";
}

export function coverageDays(m: RawMaterial): number {
  const dailyUse = m.minStock / 10;
  return Math.round((m.currentStock / dailyUse) * 10) / 10;
}

// Stock evolution over the last 6 months, per material.
export const stockHistory: { month: string; [materialId: string]: number | string }[] =
  MONTH_LABELS.map((label, i) => {
    const row: { month: string; [k: string]: number | string } = { month: label };
    rawMaterials.forEach((m, mi) => {
      const r = rng(1000 + mi * 37 + i * 11);
      const drift = 1 + (i - 5) * 0.035 * (mi % 3 === 0 ? -1 : 1);
      const noise = 0.94 + r() * 0.13;
      row[m.id] = Math.round(m.currentStock * drift * noise);
    });
    return row;
  });

const productFamilies = [
  "750ml Bordeaux Flint",
  "355ml Longneck Amber",
  "500ml Growler Green",
  "1L Juice Flint",
  "330ml Stubby Amber",
];

export const productionBatches: ProductionBatch[] = (() => {
  const out: ProductionBatch[] = [];
  productionLines.forEach((line, li) => {
    MONTHS.forEach((month, mi) => {
      for (let b = 0; b < 4; b++) {
        const r = rng(500 + li * 101 + mi * 17 + b * 7);
        const target = [520000, 460000, 380000][li]!;
        const seasonal = 1 + Math.sin((mi + li) / 2.1) * 0.045;
        const eff = 0.86 + r() * 0.11 + (mi * 0.006 - li * 0.012) + (seasonal - 1);
        const efficiency = Math.min(0.985, Math.max(0.74, eff));
        const produced = Math.round(target * efficiency);
        out.push({
          id: `B-${line.id}-${month.replace("-", "")}-${b + 1}`,
          lineId: line.id,
          date: `${month}-${String(4 + b * 7).padStart(2, "0")}`,
          producedQty: produced,
          targetQty: target,
          efficiency: Math.round(efficiency * 1000) / 10,
          downtimeMin: Math.round((1 - efficiency) * 2400 + r() * 120),
        });
      }
    });
  });
  return out;
})();

export function batchProduct(batchId: string) {
  const n = batchId.split("-").reduce((a, c) => a + c.charCodeAt(0), 0);
  return productFamilies[n % productFamilies.length]!;
}

export const downtimeCauses = [
  { cause: "Mold change / job change", lineId: "L1", minutes: 1860 },
  { cause: "IS machine mechanical fault", lineId: "L1", minutes: 1240 },
  { cause: "Gob forming instability", lineId: "L2", minutes: 1080 },
  { cause: "Annealing lehr adjustment", lineId: "L2", minutes: 760 },
  { cause: "Cold-end conveyor jam", lineId: "L3", minutes: 540 },
  { cause: "Inspection machine calibration", lineId: "L3", minutes: 420 },
  { cause: "Palletizer downtime", lineId: "L1", minutes: 310 },
  { cause: "Planned maintenance overrun", lineId: "L2", minutes: 240 },
  { cause: "Utilities / compressed air", lineId: "L3", minutes: 160 },
];

export const processVariables = [
  { key: "gobTemp", label: "Gob temperature (°C)" },
  { key: "moldCooling", label: "Mold cooling airflow (m³/h)" },
  { key: "lehrTemp", label: "Annealing lehr temperature (°C)" },
  { key: "blankPressure", label: "Blank blow pressure (bar)" },
];

export const qualityInspections: QualityInspection[] = (() => {
  const out: QualityInspection[] = [];
  const points = [
    "Hot End — Forming",
    "Cold End — Dimensional",
    "Cold End — Visual/Camera",
    "Lab — Pressure Test",
    "Lab — Thermal Shock",
  ];
  productionBatches.forEach((batch, i) => {
    const r = rng(9000 + i * 13);
    for (let k = 0; k < 2; k++) {
      const rr = rng(9000 + i * 13 + k * 3);
      const pv = processVariables[(i + k) % processVariables.length]!;
      const base = 1.1 + rr() * 2.4 + (batch.efficiency < 88 ? 1.3 : 0);
      const defectRate = Math.round(base * 100) / 100;
      const result =
        defectRate > 4.4 ? "Rejected" : defectRate > 3.7 ? "Conditional" : "Approved";
      out.push({
        id: `QI-${batch.id}-${k + 1}`,
        batchId: batch.id,
        lineId: batch.lineId,
        inspectionPoint: points[(i + k) % points.length]!,
        processVariable: pv.key,
        variableValue:
          Math.round(
            ({
              gobTemp: 1140 + defectRate * 6 + r() * 8,
              moldCooling: 1450 - defectRate * 40 + r() * 30,
              lehrTemp: 545 + defectRate * 4 + r() * 6,
              blankPressure: 2.9 - defectRate * 0.08 + r() * 0.08,
            } as Record<string, number>)[pv.key]! * 100,
          ) / 100,
        defectRate,
        result,
        date: batch.date,
      });
    }
  });
  return out;
})();

export const salesTargets: SalesTarget[] = (() => {
  const channels = [
    { channel: "Beverage OEM", region: "Southeast US" },
    { channel: "Craft Brewing", region: "Midwest US" },
    { channel: "Wine & Spirits", region: "West Coast US" },
    { channel: "Distribution Partners", region: "Export — LATAM" },
  ];
  const out: SalesTarget[] = [];
  channels.forEach((c, ci) => {
    MONTHS.forEach((period, mi) => {
      const r = rng(300 + ci * 53 + mi * 19);
      const target = [4200000, 2100000, 1650000, 980000][ci]!;
      const perf = 0.88 + r() * 0.22 + mi * 0.008 - ci * 0.02;
      const actual = Math.round(target * Math.min(1.16, Math.max(0.79, perf)));
      out.push({
        id: `ST-${c.channel.slice(0, 3).toUpperCase()}-${period}`,
        period,
        channel: c.channel,
        region: c.region,
        target,
        actual,
        availableStock: Math.round(target * (0.9 + r() * 0.25)),
        projectedDemand: Math.round(target * (0.95 + r() * 0.2)),
      });
    });
  });
  return out;
})();

export const users: AppUser[] = [
  {
    id: "U-01",
    name: "Marcus Whitfield",
    email: "m.whitfield@demo.com",
    role: "Administrator",
    status: "Active",
  },
  {
    id: "U-02",
    name: "Elena Duarte",
    email: "e.duarte@demo.com",
    role: "Production Supervisor",
    status: "Active",
  },
  {
    id: "U-03",
    name: "Priya Raman",
    email: "p.raman@demo.com",
    role: "Quality Analyst",
    status: "Active",
  },
  {
    id: "U-04",
    name: "Thomas Berger",
    email: "t.berger@demo.com",
    role: "Executive",
    status: "Active",
  },
  {
    id: "U-05",
    name: "Sofia Lindqvist",
    email: "s.lindqvist@demo.com",
    role: "Production Supervisor",
    status: "Suspended",
  },
  {
    id: "U-06",
    name: "Andre Cole",
    email: "a.cole@demo.com",
    role: "Quality Analyst",
    status: "Active",
  },
];

export interface Alert {
  id: string;
  severity: Status;
  domain: string;
  message: string;
  timestamp: string;
}

export const alerts: Alert[] = [
  {
    id: "A-1",
    severity: "critical",
    domain: "Supply",
    message: "Dolomite stock at 640 t — 29% below minimum threshold (900 t).",
    timestamp: "Aug 10, 08:12",
  },
  {
    id: "A-2",
    severity: "critical",
    domain: "Supply",
    message: "Iron Chromite coverage down to 8.4 days against a 30-day target.",
    timestamp: "Aug 10, 07:45",
  },
  {
    id: "A-3",
    severity: "warning",
    domain: "Production",
    message: "Furnace Line C — Green efficiency 4.1 pts under monthly target.",
    timestamp: "Aug 09, 22:30",
  },
  {
    id: "A-4",
    severity: "warning",
    domain: "Quality",
    message: "Cold End — Visual/Camera defect rate trending above 3.2% for 3 batches.",
    timestamp: "Aug 09, 16:05",
  },
  {
    id: "A-5",
    severity: "warning",
    domain: "Supply",
    message: "Soda Ash (Dense) at 1,180 t, marginally below minimum stock.",
    timestamp: "Aug 09, 09:20",
  },
  {
    id: "A-6",
    severity: "ok",
    domain: "Distribution",
    message: "Beverage OEM channel closed July at 104% of sales target.",
    timestamp: "Aug 08, 18:00",
  },
];

// ---- Derived executive metrics -------------------------------------------

export function monthlyTrend() {
  return MONTH_LABELS.map((label, i) => {
    const month = MONTHS[i]!;
    const batches = productionBatches.filter((b) => b.date.startsWith(month));
    const produced = batches.reduce((a, b) => a + b.producedQty, 0);
    const target = batches.reduce((a, b) => a + b.targetQty, 0);
    const insp = qualityInspections.filter((q) => q.date.startsWith(month));
    const approved = insp.filter((q) => q.result === "Approved").length;
    const sales = salesTargets.filter((s) => s.period === month);
    const salesActual = sales.reduce((a, s) => a + s.actual, 0);
    const salesTarget = sales.reduce((a, s) => a + s.target, 0);
    return {
      month: label,
      production: Math.round((produced / target) * 1000) / 10,
      quality: Math.round((approved / insp.length) * 1000) / 10,
      sales: Math.round((salesActual / salesTarget) * 1000) / 10,
    };
  });
}

export function executiveKpis() {
  const trend = monthlyTrend();
  const last = trend[trend.length - 1]!;
  const prev = trend[trend.length - 2]!;
  const coverage =
    rawMaterials.reduce((a, m) => a + coverageDays(m), 0) / rawMaterials.length;
  return {
    production: { value: last.production, delta: last.production - prev.production },
    coverage: { value: Math.round(coverage * 10) / 10, delta: -1.4 },
    sales: { value: last.sales, delta: last.sales - prev.sales },
    quality: { value: last.quality, delta: last.quality - prev.quality },
  };
}

/** Efficiency targets (%) per production line. Mutable so Admin > Targets can update them. */
export const lineEfficiencyTargets: Record<string, number> = {
  L1: 92,
  L2: 92,
  L3: 90,
};
