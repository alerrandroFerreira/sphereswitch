"use client";

import { useEffect, useState } from "react";
import { createUsageStats } from "@sphereswitch/core";
import type { ComboUsage, SphereSwitchStore, UsageStats } from "@sphereswitch/core";
import { useSphereSwitchStore } from "./useStore";

// Un registro de estadísticas por store. IndexedDB, estrictamente local.
const statsByStore = new WeakMap<SphereSwitchStore, UsageStats>();

function statsFor(store: SphereSwitchStore): UsageStats {
  let stats = statsByStore.get(store);
  if (!stats) {
    stats = createUsageStats(store);
    statsByStore.set(store, stats);
  }
  return stats;
}

export interface UseUsageStatsResult {
  readonly summary: readonly ComboUsage[];
  refresh: () => void;
}

/** Estadísticas de uso locales: monta el registro y expone el resumen agregado. */
export function useUsageStats(): UseUsageStatsResult {
  const store = useSphereSwitchStore();
  const [summary, setSummary] = useState<readonly ComboUsage[]>([]);

  useEffect(() => {
    const stats = statsFor(store);
    let cancelled = false;
    void stats.summary().then((rows) => {
      if (!cancelled) setSummary(rows);
    });
    return () => {
      cancelled = true;
      void stats.flush();
    };
  }, [store]);

  const refresh = (): void => {
    void statsFor(store).summary().then(setSummary);
  };

  return { summary, refresh };
}
