// Sistema de configuración de SphereSwitch. TypeScript puro, cero runtime real
// más allá de identidad y validación defensiva. Vive en `core` porque es
// estructura de datos sin ninguna dependencia de framework.

import { DIMENSION_FONT, DIMENSION_LAYOUT, DIMENSION_PALETTE } from "./types";
import type { SphereSwitchConfig } from "./types";

// --- Convención fija de nombres de variables CSS -----------------------------

/** Nombre de variable CSS de color. El prefijo `--color-` es obligatorio. */
export type ColorVariable = `--color-${string}`;

/** Nombre de variable CSS de tipografía. El prefijo `--font-` es obligatorio. */
export type FontVariable = `--font-${string}`;

// --- Entradas del catálogo ---------------------------------------------------

export interface PaletteEntry {
  readonly id: string;
  readonly label?: string;
  /** Referencia de origen, en términos neutros (fenómeno visual, nunca una marca). */
  readonly reference?: string;
  /**
   * `true` si evoca una estética reconocible descrita en términos neutros
   * (nunca el nombre de la marca). Mismo vocabulario que `FontPairEntry.aprox`
   * — no se invierte su sentido de una dimensión a otra.
   */
  readonly aprox?: boolean;
  readonly note?: string;
  /** Modo de color para la sincronización con el sistema operativo (Goal 17). */
  readonly mode?: "light" | "dark";
  /** Valores de variables CSS; las claves deben empezar por `--color-`. */
  readonly colors: Readonly<Record<ColorVariable, string>>;
}

export interface FontPairEntry {
  readonly id: string;
  readonly label?: string;
  readonly reference?: string;
  /** `true` si aproxima una tipografía de pago; nunca se presenta como la original. */
  readonly aprox?: boolean;
  readonly note?: string;
  /** Valores de variables CSS; las claves deben empezar por `--font-`. */
  readonly fonts: Readonly<Record<FontVariable, string>>;
}

export interface LayoutEntry {
  readonly id: string;
  readonly label?: string;
}

// --- Configuración de usuario ----------------------------------------------

/**
 * Aportación a una dimensión: un array suelto o `{ extend }` SUMAN al catálogo
 * curado; `{ replace }` lo DESCARTA y usa solo las entradas dadas.
 */
export type DimensionInput<TEntry> =
  | readonly TEntry[]
  | { readonly extend: readonly TEntry[] }
  | { readonly replace: readonly TEntry[] };

export interface SphereSwitchUserConfig {
  readonly palettes?: DimensionInput<PaletteEntry>;
  readonly fonts?: DimensionInput<FontPairEntry>;
  readonly layouts?: DimensionInput<LayoutEntry>;
  readonly defaults?: {
    readonly palette?: string;
    readonly font?: string;
    readonly layout?: string;
  };
}

/** Catálogo curado que viene de serie (se completa en los Goals 7–9). */
export interface CuratedCatalog {
  readonly palettes: readonly PaletteEntry[];
  readonly fonts: readonly FontPairEntry[];
  readonly layouts: readonly LayoutEntry[];
}

/** Catálogo final tras fusionar lo curado con lo del desarrollador. */
export type ResolvedCatalog = CuratedCatalog;

// --- defineConfig ----------------------------------------------------------

/**
 * Identidad en tiempo de ejecución. En compilación fuerza a TypeScript a
 * inferir el tipo exacto de lo que se le pasa (uniones literales de ids), en
 * vez de ensancharlo a `string` — que es lo que habilita el autocompletado
 * de los hooks vía aumento de módulo.
 */
export function defineConfig<const T extends SphereSwitchUserConfig>(config: T): T {
  return config;
}

// --- Validación a mano (sin librería de esquemas) --------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasNonEmptyStringId(value: Record<string, unknown>): boolean {
  return typeof value["id"] === "string" && value["id"].length > 0;
}

function isPrefixedStringMap(value: unknown, prefix: string): boolean {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((key) => key.startsWith(prefix) && typeof value[key] === "string");
}

export function isPaletteEntry(value: unknown): value is PaletteEntry {
  return (
    isRecord(value) &&
    hasNonEmptyStringId(value) &&
    isPrefixedStringMap(value["colors"], "--color-")
  );
}

export function isFontPairEntry(value: unknown): value is FontPairEntry {
  return (
    isRecord(value) && hasNonEmptyStringId(value) && isPrefixedStringMap(value["fonts"], "--font-")
  );
}

export function isLayoutEntry(value: unknown): value is LayoutEntry {
  return isRecord(value) && hasNonEmptyStringId(value);
}

// --- Fusión curado + usuario ---------------------------------------------

interface NormalizedInput<TEntry> {
  readonly mode: "extend" | "replace";
  readonly entries: readonly TEntry[];
}

function normalizeInput<TEntry>(
  input: DimensionInput<TEntry> | undefined,
): NormalizedInput<TEntry> {
  if (input === undefined) return { mode: "extend", entries: [] };
  if (Array.isArray(input)) {
    return { mode: "extend", entries: input as readonly TEntry[] };
  }
  const record = input as {
    readonly extend?: readonly TEntry[];
    readonly replace?: readonly TEntry[];
  };
  if (record.replace !== undefined) return { mode: "replace", entries: record.replace };
  return { mode: "extend", entries: record.extend ?? [] };
}

function resolveDimension<TEntry extends { readonly id: string }>(
  label: string,
  input: DimensionInput<TEntry> | undefined,
  curated: readonly TEntry[],
  guard: (value: unknown) => value is TEntry,
): readonly TEntry[] {
  const { mode, entries } = normalizeInput(input);

  const accepted: TEntry[] = [];
  for (const entry of entries) {
    if (guard(entry)) {
      accepted.push(entry);
    } else {
      console.warn(`[sphereswitch] Entrada de ${label} descartada por formato inválido:`, entry);
    }
  }

  const base = mode === "replace" ? [] : curated;
  const byId = new Map<string, TEntry>();
  // El usuario pisa al curado cuando comparten id.
  for (const entry of [...base, ...accepted]) byId.set(entry.id, entry);
  return [...byId.values()];
}

/** Fusiona la configuración del desarrollador con el catálogo curado de serie. */
export function resolveCatalog(
  user: SphereSwitchUserConfig | undefined,
  curated: CuratedCatalog,
): ResolvedCatalog {
  return {
    palettes: resolveDimension("paleta", user?.palettes, curated.palettes, isPaletteEntry),
    fonts: resolveDimension("fuente", user?.fonts, curated.fonts, isFontPairEntry),
    layouts: resolveDimension("layout", user?.layouts, curated.layouts, isLayoutEntry),
  };
}

// --- Puente hacia el store del núcleo -----------------------------------

function toDimension(
  name: string,
  entries: readonly { readonly id: string }[],
  preferredDefault: string | undefined,
): SphereSwitchConfig["dimensions"][number] {
  const values = entries.map((entry) => entry.id);
  if (values.length === 0) {
    // Sin entradas todavía: dimensión con un único valor neutro para que el
    // store no rompa antes de que existan los catálogos curados.
    return { name, values: ["default"], defaultValue: "default" };
  }
  const defaultValue =
    preferredDefault !== undefined && values.includes(preferredDefault)
      ? preferredDefault
      : (values[0] as string);
  return { name, values, defaultValue };
}

/** Deriva la configuración de dimensiones que consume `createStore`. */
export function resolveStoreConfig(
  catalog: ResolvedCatalog,
  defaults?: SphereSwitchUserConfig["defaults"],
): SphereSwitchConfig {
  return {
    dimensions: [
      toDimension(DIMENSION_FONT, catalog.fonts, defaults?.font),
      toDimension(DIMENSION_PALETTE, catalog.palettes, defaults?.palette),
      toDimension(DIMENSION_LAYOUT, catalog.layouts, defaults?.layout),
    ],
  };
}

// --- Aumento de módulo: tipado de ids hasta los hooks ------------------

/**
 * Interfaz vacía y extensible. El `sphereswitch.config.ts` del proyecto la
 * aumenta con `declare module "@sphereswitch/core"` para que `usePalette()`,
 * `useFont()` y `useLayout()` autocompleten los ids concretos registrados.
 * Sin aumento, los ids degradan a `string` (p. ej. si el config está en JS).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SphereSwitchRegisteredConfig {}

type IdsOf<TInput> = TInput extends readonly (infer TEntry)[]
  ? TEntry extends { readonly id: infer TId extends string }
    ? TId
    : string
  : TInput extends { readonly extend: infer TExtend }
    ? IdsOf<TExtend>
    : TInput extends { readonly replace: infer TReplace }
      ? IdsOf<TReplace>
      : string;

export type RegisteredPaletteId = SphereSwitchRegisteredConfig extends {
  palettes: infer TPalettes;
}
  ? IdsOf<TPalettes>
  : string;

export type RegisteredFontId = SphereSwitchRegisteredConfig extends { fonts: infer TFonts }
  ? IdsOf<TFonts>
  : string;

export type RegisteredLayoutId = SphereSwitchRegisteredConfig extends {
  layouts: infer TLayouts;
}
  ? IdsOf<TLayouts>
  : string;
