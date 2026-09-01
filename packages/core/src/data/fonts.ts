// Catálogo curado de parejas tipográficas. Dato puro, sin dependencia de
// framework — vive en `core` y lo consumen `react` y `widget` sin duplicarlo.
//
// Criterio único de curaduría (v1: 24 pares, ninguno de relleno):
// - Cada par tiene una referencia de estilo real y una licencia abierta vigente.
// - `isApproximation: true` SOLO en los pares inspirados en una tipografía de
//   pago; su `approximationNote` nunca insinúa que sea "la misma fuente".
// - La carga de archivos de fuente es perezosa: ver ./fontLoader.ts.

import type { FontPairEntry } from "../config";

export type FontSource = "google-fonts" | "fontshare";

export interface FontFace {
  /** `font-family` real a cargar. */
  readonly family: string;
  /** De dónde se sirven los archivos. */
  readonly source: FontSource;
  /** Pesos disponibles/necesarios. */
  readonly weights: readonly number[];
  /** Pila de reserva en CSS mientras la fuente carga o si falla. */
  readonly fallback: string;
}

export interface FontPair {
  readonly id: string;
  /** Nombre para mostrar, p. ej. "Fraunces & Inter". */
  readonly name: string;
  readonly displayFont: FontFace;
  readonly bodyFont: FontFace;
  /** Tipografía de pago real que evoca el par (solo si es aproximación). */
  readonly inspiredBy?: string;
  readonly isApproximation: boolean;
  /** Nota honesta sobre el parecido. Obligatoria si `isApproximation`. */
  readonly approximationNote?: string;
  /** Licencia real y vigente, p. ej. "SIL Open Font License 1.1". */
  readonly license: string;
}

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, Cambria, 'Times New Roman', Times, serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const OFL = "SIL Open Font License 1.1";
const ITF = "ITF Free Font License";

const g = (family: string, weights: readonly number[], fallback: string): FontFace => ({
  family,
  source: "google-fonts",
  weights,
  fallback,
});

const fs = (family: string, weights: readonly number[], fallback: string): FontFace => ({
  family,
  source: "fontshare",
  weights,
  fallback,
});

export const FONT_PAIRS: readonly FontPair[] = [
  // --- Aproximaciones a tipografías premium (16) ---------------------------
  {
    id: "canela",
    name: "Fraunces & Inter",
    displayFont: g("Fraunces", [400, 500, 600, 700], SERIF),
    bodyFont: g("Inter", [400, 500, 600], SANS),
    inspiredBy: "Canela — Commercial Type",
    isApproximation: true,
    approximationNote:
      "Alternativa abierta con el contraste alto y los remates de aire clásico que caracterizan a Canela.",
    license: OFL,
  },
  {
    id: "reckless",
    name: "Zodiak & Switzer",
    displayFont: fs("Zodiak", [400, 500, 700], SERIF),
    bodyFont: fs("Switzer", [400, 500, 600], SANS),
    inspiredBy: "Reckless — MassiveType",
    isApproximation: true,
    approximationNote:
      "Zodiak recupera el contraste marcado y el aire editorial que hace reconocible a Reckless.",
    license: ITF,
  },
  {
    id: "neue-haas-grotesk",
    name: "General Sans & Satoshi",
    displayFont: fs("General Sans", [500, 600, 700], SANS),
    bodyFont: fs("Satoshi", [400, 500, 700], SANS),
    inspiredBy: "Neue Haas Grotesk — Linotype",
    isApproximation: true,
    approximationNote: "Grotescas neutras de raíz suiza, con carácter próximo al de Neue Haas.",
    license: ITF,
  },
  {
    id: "sohne",
    name: "Familjen Grotesk & Inter",
    displayFont: g("Familjen Grotesk", [400, 500, 600, 700], SANS),
    bodyFont: g("Inter", [400, 500], SANS),
    inspiredBy: "Söhne — Klim Type Foundry",
    isApproximation: true,
    approximationNote:
      "Familjen Grotesk comparte la base Akzidenz y la neutralidad funcional de Söhne.",
    license: OFL,
  },
  {
    id: "graphik",
    name: "Hanken Grotesk",
    displayFont: g("Hanken Grotesk", [500, 600, 700], SANS),
    bodyFont: g("Hanken Grotesk", [400, 500], SANS),
    inspiredBy: "Graphik — Commercial Type",
    isApproximation: true,
    approximationNote:
      "Hanken Grotesk ofrece la grotesca geométrica templada y de amplio uso que popularizó Graphik.",
    license: OFL,
  },
  {
    id: "gt-america",
    name: "Switzer",
    displayFont: fs("Switzer", [500, 600, 700], SANS),
    bodyFont: fs("Switzer", [400, 500], SANS),
    inspiredBy: "GT America — Grilli Type",
    isApproximation: true,
    approximationNote:
      "Switzer cubre el mismo terreno entre grotesca europea y americana que GT America.",
    license: ITF,
  },
  {
    id: "gt-walsheim",
    name: "Outfit & Work Sans",
    displayFont: g("Outfit", [400, 500, 600, 700], SANS),
    bodyFont: g("Work Sans", [400, 500], SANS),
    inspiredBy: "GT Walsheim — Grilli Type",
    isApproximation: true,
    approximationNote:
      "Outfit reproduce la geometría amable y las terminaciones redondeadas de GT Walsheim.",
    license: OFL,
  },
  {
    id: "circular",
    name: "DM Sans",
    displayFont: g("DM Sans", [500, 600, 700], SANS),
    bodyFont: g("DM Sans", [400, 500], SANS),
    inspiredBy: "Circular — Lineto",
    isApproximation: true,
    approximationNote:
      "DM Sans comparte el esqueleto geométrico-humanista y las curvas limpias de Circular.",
    license: OFL,
  },
  {
    id: "apercu",
    name: "Work Sans",
    displayFont: g("Work Sans", [500, 600, 700], SANS),
    bodyFont: g("Work Sans", [400, 500], SANS),
    inspiredBy: "Apercu — Colophon Foundry",
    isApproximation: true,
    approximationNote:
      "Work Sans tiene la misma mezcla de grotesca clásica y detalle humanista que Apercu.",
    license: OFL,
  },
  {
    id: "druk",
    name: "Anton & Inter",
    displayFont: g("Anton", [400], SANS),
    bodyFont: g("Inter", [400, 500], SANS),
    inspiredBy: "Druk — Commercial Type",
    isApproximation: true,
    approximationNote:
      "Anton aporta el peso condensado extremo y el impacto de titular que define a Druk.",
    license: OFL,
  },
  {
    id: "tiempos",
    name: "Source Serif 4 & Source Sans 3",
    displayFont: g("Source Serif 4", [400, 600, 700], SERIF),
    bodyFont: g("Source Sans 3", [400, 500], SANS),
    inspiredBy: "Tiempos Text — Klim Type Foundry",
    isApproximation: true,
    approximationNote:
      "Source Serif recoge la transicional sobria y de alta legibilidad para prensa de Tiempos.",
    license: OFL,
  },
  {
    id: "publico",
    name: "Newsreader",
    displayFont: g("Newsreader", [400, 500, 600], SERIF),
    bodyFont: g("Newsreader", [400, 500], SERIF),
    inspiredBy: "Publico — Commercial Type",
    isApproximation: true,
    approximationNote:
      "Newsreader comparte el origen en tipografía de periódico y el contraste moderado de Publico.",
    license: OFL,
  },
  {
    id: "signifier",
    name: "Cormorant & Inter",
    displayFont: g("Cormorant", [400, 500, 600], SERIF),
    bodyFont: g("Inter", [400, 500], SANS),
    inspiredBy: "Signifier — Klim Type Foundry",
    isApproximation: true,
    approximationNote:
      "Cormorant lleva al extremo el contraste de pluma y el aire barroco que Signifier reinterpreta.",
    license: OFL,
  },
  {
    id: "gt-sectra",
    name: "Literata",
    displayFont: g("Literata", [400, 500, 600, 700], SERIF),
    bodyFont: g("Literata", [400, 500], SERIF),
    inspiredBy: "GT Sectra — Grilli Type",
    isApproximation: true,
    approximationNote:
      "Literata combina remates afilados con robustez de lectura, en la línea del gesto de escalpelo de GT Sectra.",
    license: OFL,
  },
  {
    id: "maison-neue",
    name: "Albert Sans",
    displayFont: g("Albert Sans", [500, 600, 700], SANS),
    bodyFont: g("Albert Sans", [400, 500], SANS),
    inspiredBy: "Maison Neue — Milieu Grotesque",
    isApproximation: true,
    approximationNote:
      "Albert Sans recupera la geometría de los años 20 depurada que define a Maison Neue.",
    license: OFL,
  },
  {
    id: "monument-grotesk",
    name: "Space Grotesk & Inter",
    displayFont: g("Space Grotesk", [400, 500, 600, 700], SANS),
    bodyFont: g("Inter", [400, 500], SANS),
    inspiredBy: "Monument Grotesk — ABC Dinamo",
    isApproximation: true,
    approximationNote:
      "Space Grotesk comparte las proporciones ajustadas y el aire técnico y contemporáneo de Monument Grotesk.",
    license: OFL,
  },

  // --- Parejas abiertas curadas, sin referencia de pago (8) ---------------
  {
    id: "ibm-plex",
    name: "IBM Plex Serif & IBM Plex Sans",
    displayFont: g("IBM Plex Serif", [400, 500, 600], SERIF),
    bodyFont: g("IBM Plex Sans", [400, 500, 600], SANS),
    isApproximation: false,
    license: OFL,
  },
  {
    id: "grotesk-editorial",
    name: "Space Grotesk & Newsreader",
    displayFont: g("Space Grotesk", [500, 600, 700], SANS),
    bodyFont: g("Newsreader", [400, 500], SERIF),
    isApproximation: false,
    license: OFL,
  },
  {
    id: "franklin-lora",
    name: "Libre Franklin & Lora",
    displayFont: g("Libre Franklin", [600, 700, 800], SANS),
    bodyFont: g("Lora", [400, 500], SERIF),
    isApproximation: false,
    license: OFL,
  },
  {
    id: "geometric-neutral",
    name: "Poppins & Inter",
    displayFont: g("Poppins", [500, 600, 700], SANS),
    bodyFont: g("Inter", [400, 500], SANS),
    isApproximation: false,
    license: OFL,
  },
  {
    id: "terminal-display",
    name: "Space Mono & Inter",
    displayFont: g("Space Mono", [400, 700], MONO),
    bodyFont: g("Inter", [400, 500], SANS),
    isApproximation: false,
    license: OFL,
  },
  {
    id: "optical-serif",
    name: "Fraunces & Work Sans",
    displayFont: g("Fraunces", [400, 500, 600], SERIF),
    bodyFont: g("Work Sans", [400, 500], SANS),
    isApproximation: false,
    license: OFL,
  },
  {
    id: "all-serif-contrast",
    name: "Playfair Display & Source Serif 4",
    displayFont: g("Playfair Display", [500, 600, 700], SERIF),
    bodyFont: g("Source Serif 4", [400, 500], SERIF),
    isApproximation: false,
    license: OFL,
  },
  {
    id: "modern-editorial",
    name: "Bricolage Grotesque & Literata",
    displayFont: g("Bricolage Grotesque", [500, 600, 700], SANS),
    bodyFont: g("Literata", [400, 500], SERIF),
    isApproximation: false,
    license: OFL,
  },
];

const byId = new Map(FONT_PAIRS.map((pair) => [pair.id, pair]));

export function getFontPairById(id: string): FontPair | undefined {
  return byId.get(id);
}

/** Adapta un `FontPair` del catálogo a la forma de entrada de configuración (Goal 5). */
export function fontPairToEntry(pair: FontPair): FontPairEntry {
  return {
    id: pair.id,
    label: pair.name,
    aprox: pair.isApproximation,
    ...(pair.inspiredBy !== undefined ? { reference: pair.inspiredBy } : {}),
    ...(pair.approximationNote !== undefined ? { note: pair.approximationNote } : {}),
    fonts: {
      "--font-display": `'${pair.displayFont.family}', ${pair.displayFont.fallback}`,
      "--font-body": `'${pair.bodyFont.family}', ${pair.bodyFont.fallback}`,
    },
  };
}

/** El catálogo de fuentes en forma de entradas de configuración curadas. */
export const CURATED_FONTS: readonly FontPairEntry[] = FONT_PAIRS.map(fontPairToEntry);
