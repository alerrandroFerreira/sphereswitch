"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createHistory } from "@sphereswitch/core";
import type { HistoryEntry, SphereSwitchHistory, SphereSwitchStore } from "@sphereswitch/core";
import { useSphereSwitchStore } from "./useStore";

// Un historial por store (Provider o global). El WeakMap deja que se recoja
// junto con el store al que pertenece.
const historyByStore = new WeakMap<SphereSwitchStore, SphereSwitchHistory>();

function historyFor(store: SphereSwitchStore): SphereSwitchHistory {
  let history = historyByStore.get(store);
  if (!history) {
    history = createHistory(store);
    historyByStore.set(store, history);
  }
  return history;
}

export interface UseHistoryResult {
  undo: () => boolean;
  redo: () => boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly entries: readonly HistoryEntry[];
  readonly cursor: number;
}

/** Historial de combinaciones con deshacer/rehacer, reactivo. */
export function useHistory(): UseHistoryResult {
  const store = useSphereSwitchStore();
  const history = useMemo(() => historyFor(store), [store]);

  useSyncExternalStore(history.subscribe, history.version, () => 0);

  return {
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo(),
    canRedo: history.canRedo(),
    entries: history.entries(),
    cursor: history.cursor(),
  };
}
