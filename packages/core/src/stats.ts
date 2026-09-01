// Estadísticas de uso: qué combinaciones se probaron más y cuánto tiempo
// estuvieron activas.
//
// A diferencia de todo lo demás en el proyecto, esto usa **IndexedDB**, no
// localStorage: son datos que crecen con el tiempo de uso (una entrada por
// combinación probada) y localStorage tiene límites de tamaño ajustados
// (~5-10 MB) y es síncrono y bloqueante. Es una excepción deliberada.
//
// **Estrictamente local**: nada de telemetría enviada a ningún servidor.

import { comboKey } from "./comboNames";
import type { Combo } from "./history";
import type { SphereSwitchStore } from "./types";

const DB_NAME = "sphereswitch-stats";
const STORE_NAME = "sessions";
const DB_VERSION = 1;

interface SessionRecord {
  readonly comboKey: string;
  readonly enteredAt: number;
  readonly leftAt: number;
}

export interface ComboUsage {
  readonly comboKey: string;
  /** Número de veces que se activó esa combinación. */
  readonly count: number;
  /** Tiempo total activa, en milisegundos. */
  readonly totalMs: number;
}

export interface UsageStats {
  /** Cierra la sesión en curso en disco (útil antes de leer un resumen). */
  flush(): Promise<void>;
  /** Resumen agregado por combinación, de más a menos tiempo activo. */
  summary(): Promise<ComboUsage[]>;
  clear(): Promise<void>;
  destroy(): void;
}

function idbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB no disponible"));
  });
}

function currentCombo(store: SphereSwitchStore): Combo {
  const state = store.getState();
  return {
    font: state["font"] ?? "",
    palette: state["palette"] ?? "",
    layout: state["layout"] ?? "",
  };
}

/** Empieza a registrar sesiones de combinación a partir del estado del store. */
export function createUsageStats(store: SphereSwitchStore): UsageStats {
  let dbPromise: Promise<IDBDatabase> | null = idbAvailable() ? openDb() : null;
  let activeKey = comboKey(currentCombo(store));
  let enteredAt = Date.now();
  let destroyed = false;

  async function put(record: SessionRecord): Promise<void> {
    if (!dbPromise) return;
    try {
      const db = await dbPromise;
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).add(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // IndexedDB bloqueado o lleno: se ignora, las estadísticas son opcionales.
    }
  }

  function onChange(): void {
    if (destroyed) return;
    const nextKey = comboKey(currentCombo(store));
    if (nextKey === activeKey) return;
    const now = Date.now();
    void put({ comboKey: activeKey, enteredAt, leftAt: now });
    activeKey = nextKey;
    enteredAt = now;
  }

  const unsubscribe = store.subscribe(onChange);

  async function persisted(): Promise<SessionRecord[]> {
    if (!dbPromise) return [];
    const db = await dbPromise;
    return new Promise<SessionRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as SessionRecord[]);
      request.onerror = () => reject(request.error);
    });
  }

  return {
    async flush() {
      const now = Date.now();
      await put({ comboKey: activeKey, enteredAt, leftAt: now });
      enteredAt = now;
    },
    async summary() {
      // La sesión en curso se cuenta sin escribirla (así summary no muta nada).
      const records = [
        ...(await persisted()),
        { comboKey: activeKey, enteredAt, leftAt: Date.now() },
      ];
      const byCombo = new Map<string, { count: number; totalMs: number }>();
      for (const record of records) {
        const entry = byCombo.get(record.comboKey) ?? { count: 0, totalMs: 0 };
        entry.count += 1;
        entry.totalMs += Math.max(0, record.leftAt - record.enteredAt);
        byCombo.set(record.comboKey, entry);
      }
      return [...byCombo.entries()]
        .map(([key, value]) => ({ comboKey: key, ...value }))
        .sort((a, b) => b.totalMs - a.totalMs);
    },
    async clear() {
      if (!dbPromise) return;
      const db = await dbPromise;
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    destroy() {
      destroyed = true;
      unsubscribe();
      void dbPromise?.then((db) => db.close());
      dbPromise = null;
    },
  };
}
