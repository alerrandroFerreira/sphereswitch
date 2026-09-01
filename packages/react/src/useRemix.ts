"use client";

import { useCallback, useMemo } from "react";
import { createRejectedCombos } from "@sphereswitch/core";
import type { RejectedCombos } from "@sphereswitch/core";
import { useSphereSwitchStore } from "./useStore";

let rejected: RejectedCombos | null = null;
function getRejected(): RejectedCombos {
  rejected ??= createRejectedCombos();
  return rejected;
}

function comboOf(store: ReturnType<typeof useSphereSwitchStore>): {
  font: string;
  palette: string;
  layout: string;
} {
  const state = store.getState();
  return {
    font: state["font"] ?? "",
    palette: state["palette"] ?? "",
    layout: state["layout"] ?? "",
  };
}

function pick<T>(values: readonly T[]): T | undefined {
  return values.length > 0 ? values[Math.floor(Math.random() * values.length)] : undefined;
}

export interface UseRemixResult {
  /** Aplica una combinación aleatoria válida, saltándose las descartadas. */
  remix: () => void;
  /** Marca la combinación activa como descartada, para que el remix no la repita. */
  rejectCurrent: () => void;
  isRejected: () => boolean;
}

export function useRemix(): UseRemixResult {
  const store = useSphereSwitchStore();
  const dimensions = useMemo(() => store.getConfig().dimensions, [store]);

  const remix = useCallback(() => {
    const rej = getRejected();
    const values = (name: string): readonly string[] =>
      dimensions.find((d) => d.name === name)?.values ?? [];

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = {
        font: pick(values("font")) ?? store.getState()["font"] ?? "",
        palette: pick(values("palette")) ?? store.getState()["palette"] ?? "",
        layout: pick(values("layout")) ?? store.getState()["layout"] ?? "",
      };
      if (rej.isRejected(candidate)) continue;
      for (const dimension of ["font", "palette", "layout"] as const) {
        if (values(dimension).includes(candidate[dimension]))
          store.set(dimension, candidate[dimension]);
      }
      return;
    }
  }, [store, dimensions]);

  const rejectCurrent = useCallback(() => {
    getRejected().reject(comboOf(store));
  }, [store]);

  const isRejected = useCallback(() => getRejected().isRejected(comboOf(store)), [store]);

  return { remix, rejectCurrent, isRejected };
}
