// Historial de combinaciones con deshacer/rehacer. Estado puro, agnóstico de
// framework, persistido en localStorage — igual que el store principal.
//
// El historial NO es el estado activo: es un registro de estados pasados, con
// su propia clave de almacenamiento, separada de las de estado "actual".

import { createStorage } from "./storage";
import type { SphereSwitchStorage } from "./storage";
import type { SphereSwitchStore } from "./types";

/** Las tres dimensiones de serie que forman una "combinación". */
export interface Combo {
  readonly font: string;
  readonly palette: string;
  readonly layout: string;
}

export interface HistoryEntry extends Combo {
  readonly timestamp: number;
}

export interface SphereSwitchHistory {
  /** Registra la combinación actual del store como nueva entrada. */
  push(): void;
  /** Mueve el cursor atrás y aplica esa combinación. Devuelve `false` si no se puede. */
  undo(): boolean;
  /** Mueve el cursor adelante y aplica esa combinación. Devuelve `false` si no se puede. */
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  entries(): readonly HistoryEntry[];
  /** Índice de la entrada "actual" dentro de `entries()`; `-1` si está vacío. */
  cursor(): number;
  /** Contador que cambia en cada modificación — para `useSyncExternalStore`. */
  version(): number;
  subscribe(listener: () => void): () => void;
  clear(): void;
  destroy(): void;
}

const HISTORY_KEY = "sphereswitch:history";
const CURSOR_KEY = "sphereswitch:history-cursor";
const DEFAULT_MAX = 50;
const COMBO_DIMENSIONS = ["font", "palette", "layout"] as const;

export interface HistoryOptions {
  readonly storage?: SphereSwitchStorage;
  /** Máximo de entradas; al superarlo se expulsan las más antiguas. Por defecto 50. */
  readonly max?: number;
}

function isEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry["font"] === "string" &&
    typeof entry["palette"] === "string" &&
    typeof entry["layout"] === "string" &&
    typeof entry["timestamp"] === "number"
  );
}

function comboEquals(a: Combo, b: Combo): boolean {
  return a.font === b.font && a.palette === b.palette && a.layout === b.layout;
}

function readCombo(store: SphereSwitchStore): Combo {
  const state = store.getState();
  return {
    font: state["font"] ?? "",
    palette: state["palette"] ?? "",
    layout: state["layout"] ?? "",
  };
}

export function createHistory(
  store: SphereSwitchStore,
  options: HistoryOptions = {},
): SphereSwitchHistory {
  const storage = options.storage ?? createStorage();
  const max = options.max ?? DEFAULT_MAX;
  const listeners = new Set<() => void>();
  const registered = new Set(store.getConfig().dimensions.map((d) => d.name));

  let applying = false;
  let ticks = 0;

  let entries: HistoryEntry[] = loadEntries();
  let cursor = loadCursor();

  function loadEntries(): HistoryEntry[] {
    try {
      const raw = storage.get(HISTORY_KEY);
      const parsed: unknown = raw !== null ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(isEntry).slice(-max) : [];
    } catch {
      return [];
    }
  }

  function loadCursor(): number {
    const raw = storage.get(CURSOR_KEY);
    const parsed = raw !== null ? Number.parseInt(raw, 10) : entries.length - 1;
    return Number.isInteger(parsed) && parsed >= -1 && parsed < entries.length
      ? parsed
      : entries.length - 1;
  }

  function persist(): void {
    storage.set(HISTORY_KEY, JSON.stringify(entries));
    storage.set(CURSOR_KEY, String(cursor));
  }

  function notify(): void {
    ticks += 1;
    for (const listener of [...listeners]) listener();
  }

  function applyCombo(combo: Combo): void {
    applying = true;
    try {
      for (const dimension of COMBO_DIMENSIONS) {
        if (registered.has(dimension) && combo[dimension]) {
          store.set(dimension, combo[dimension]);
        }
      }
    } finally {
      applying = false;
    }
  }

  function record(): void {
    if (applying) return;
    const combo = readCombo(store);
    const currentEntry = cursor >= 0 ? entries[cursor] : undefined;
    if (currentEntry && comboEquals(currentEntry, combo)) return;

    // Cualquier cambio nuevo mientras el cursor no está en la punta descarta
    // todo lo que había "hacia adelante" — como el deshacer de un editor.
    entries = entries.slice(0, cursor + 1);
    entries.push({ ...combo, timestamp: Date.now() });
    if (entries.length > max) entries = entries.slice(entries.length - max);
    cursor = entries.length - 1;

    persist();
    notify();
  }

  record(); // captura el estado inicial
  const unsubscribeStore = store.subscribe(record);

  return {
    push: record,
    undo() {
      if (cursor <= 0) return false;
      cursor -= 1;
      applyCombo(entries[cursor] as HistoryEntry);
      persist();
      notify();
      return true;
    },
    redo() {
      if (cursor >= entries.length - 1) return false;
      cursor += 1;
      applyCombo(entries[cursor] as HistoryEntry);
      persist();
      notify();
      return true;
    },
    canUndo: () => cursor > 0,
    canRedo: () => cursor < entries.length - 1,
    entries: () => entries,
    cursor: () => cursor,
    version: () => ticks,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    clear() {
      entries = [];
      cursor = -1;
      persist();
      notify();
    },
    destroy() {
      unsubscribeStore();
      listeners.clear();
    },
  };
}
