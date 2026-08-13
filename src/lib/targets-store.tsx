import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MONTHS,
  lineEfficiencyTargets,
  productionLines,
  rawMaterials,
  salesTargets,
} from "./mock-data";

export interface TargetOverrides {
  materials: Record<string, number>;
  lines: Record<string, number>;
  channels: Record<string, number>;
}

const STORAGE_KEY = "demo.targets";

function currentTargets(): TargetOverrides {
  const last = MONTHS[MONTHS.length - 1]!;
  return {
    materials: Object.fromEntries(rawMaterials.map((m) => [m.id, m.coverageTarget])),
    lines: Object.fromEntries(
      productionLines.map((l) => [l.id, lineEfficiencyTargets[l.id] ?? 90]),
    ),
    channels: Object.fromEntries(
      salesTargets.filter((s) => s.period === last).map((s) => [s.channel, s.target]),
    ),
  };
}

/** Writes the edited targets straight into the mock dataset so every dashboard reacts. */
function applyToMockData(next: TargetOverrides) {
  rawMaterials.forEach((m) => {
    const v = next.materials[m.id];
    if (typeof v === "number" && Number.isFinite(v)) m.coverageTarget = v;
  });

  productionLines.forEach((l) => {
    const v = next.lines[l.id];
    if (typeof v === "number" && Number.isFinite(v)) lineEfficiencyTargets[l.id] = v;
  });

  const last = MONTHS[MONTHS.length - 1]!;
  const baseline = new Map<string, number>();
  salesTargets
    .filter((s) => s.period === last)
    .forEach((s) => baseline.set(s.channel, s.target));

  salesTargets.forEach((s) => {
    const v = next.channels[s.channel];
    const base = baseline.get(s.channel);
    if (typeof v !== "number" || !Number.isFinite(v) || !base) return;
    // Scale every period proportionally so trends stay coherent.
    const ratio = v / base;
    s.target = Math.round(s.target * ratio);
  });
}

interface TargetsContextValue {
  targets: TargetOverrides;
  /** Increments on every save; use it as a dependency to recompute derived data. */
  version: number;
  saveTargets: (next: TargetOverrides) => void;
}

const TargetsContext = createContext<TargetsContextValue | null>(null);

export function TargetsProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<TargetOverrides>(() => currentTargets());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as TargetOverrides;
      const merged: TargetOverrides = {
        materials: { ...currentTargets().materials, ...stored.materials },
        lines: { ...currentTargets().lines, ...stored.lines },
        channels: { ...currentTargets().channels, ...stored.channels },
      };
      applyToMockData(merged);
      setTargets(merged);
      setVersion((v) => v + 1);
    } catch {
      /* ignore */
    }
  }, []);

  const saveTargets = useCallback((next: TargetOverrides) => {
    applyToMockData(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setTargets(next);
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({ targets, version, saveTargets }),
    [targets, version, saveTargets],
  );

  return <TargetsContext.Provider value={value}>{children}</TargetsContext.Provider>;
}

export function useTargets() {
  const ctx = useContext(TargetsContext);
  if (!ctx) throw new Error("useTargets must be used inside TargetsProvider");
  return ctx;
}
