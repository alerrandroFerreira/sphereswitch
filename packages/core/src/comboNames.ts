// Nombres automáticos de combinación. Diccionario propio en localStorage:
// hash(font+palette+layout) -> nombre. Formato:
//   <nombre de la paleta> <adjetivo curado> #<número secuencial global>
//
// - El número secuencial nunca se reutiliza, aunque se borre un combo del
//   historial: cada nombre generado en la vida del proyecto es único.
// - Si la misma combinación se revisita, se devuelve el nombre ya generado la
//   primera vez, en vez de crear otro.

import { createStorage } from "./storage";
import type { SphereSwitchStorage } from "./storage";
import type { Combo } from "./history";

const NAMES_KEY = "sphereswitch:combo-names";
const SEQ_KEY = "sphereswitch:combo-seq";

export const COMBO_ADJECTIVES = [
  "Serena",
  "Vívida",
  "Sobria",
  "Nítida",
  "Cálida",
  "Templada",
  "Audaz",
  "Silente",
  "Difusa",
  "Tersa",
  "Rotunda",
  "Etérea",
  "Grave",
  "Lúcida",
  "Franca",
  "Umbría",
  "Diáfana",
  "Adusta",
  "Plácida",
  "Firme",
] as const;

export interface ComboNamer {
  nameFor(combo: Combo, paletteLabel: string): string;
}

function comboKey(combo: Combo): string {
  return `${combo.font}|${combo.palette}|${combo.layout}`;
}

function hashInt(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createComboNamer(storage: SphereSwitchStorage = createStorage()): ComboNamer {
  function readNames(): Record<string, string> {
    try {
      const raw = storage.get(NAMES_KEY);
      const parsed: unknown = raw !== null ? JSON.parse(raw) : {};
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, string>)
        : {};
    } catch {
      return {};
    }
  }

  function readSeq(): number {
    const raw = storage.get(SEQ_KEY);
    const parsed = raw !== null ? Number.parseInt(raw, 10) : 0;
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  }

  return {
    nameFor(combo, paletteLabel) {
      const key = comboKey(combo);
      const names = readNames();
      const existing = names[key];
      if (existing !== undefined) return existing;

      const seq = readSeq() + 1;
      const adjective = COMBO_ADJECTIVES[hashInt(key) % COMBO_ADJECTIVES.length] as string;
      const name = `${paletteLabel} ${adjective} #${seq}`;

      names[key] = name;
      storage.set(NAMES_KEY, JSON.stringify(names));
      storage.set(SEQ_KEY, String(seq));
      return name;
    },
  };
}
