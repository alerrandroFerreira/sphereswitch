// Registro de combinaciones descartadas. Clave propia en localStorage; un Set
// de claves de combo — el MISMO esquema de hash que el sistema de nombres
// automáticos del Goal 14, no uno nuevo. El remix aleatorio filtra este
// conjunto antes de proponer una combinación.

import { comboKey } from "./comboNames";
import { createStorage } from "./storage";
import type { SphereSwitchStorage } from "./storage";
import type { Combo } from "./history";

const REJECTED_KEY = "sphereswitch:rejected";

export interface RejectedCombos {
  reject(combo: Combo): void;
  unreject(combo: Combo): void;
  isRejected(combo: Combo): boolean;
  list(): readonly string[];
}

export function createRejectedCombos(
  storage: SphereSwitchStorage = createStorage(),
): RejectedCombos {
  function read(): Set<string> {
    try {
      const raw = storage.get(REJECTED_KEY);
      const parsed: unknown = raw !== null ? JSON.parse(raw) : [];
      return new Set(
        Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [],
      );
    } catch {
      return new Set();
    }
  }

  function write(set: Set<string>): void {
    storage.set(REJECTED_KEY, JSON.stringify([...set]));
  }

  return {
    reject(combo) {
      const set = read();
      set.add(comboKey(combo));
      write(set);
    },
    unreject(combo) {
      const set = read();
      set.delete(comboKey(combo));
      write(set);
    },
    isRejected(combo) {
      return read().has(comboKey(combo));
    },
    list() {
      return [...read()];
    },
  };
}
