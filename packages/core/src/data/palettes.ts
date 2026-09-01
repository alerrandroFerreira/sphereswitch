// Catálogo curado de paletas de color. Dato puro, sin dependencia de framework.
//
// Criterio único de curaduría (v1: 20 paletas):
// - Vocabulario consistente con el catálogo de fuentes: `isApproximation` +
//   `approximationNote` (mismo sentido, no invertido).
// - Las referencias son fenómenos visuales describibles y neutros (naturaleza,
//   materiales, movimientos de diseño), nunca el nombre de una marca.
// - Cada paleta cumple WCAG AA (contraste background/foreground ≥ 4.5:1); el
//   ratio real está calculado y guardado, no verificado a ojo.

import { contrastRatio } from "../contrast";
import type { PaletteEntry } from "../config";

export interface PaletteColors {
  readonly background: string;
  readonly foreground: string;
  readonly accent: string;
  readonly accentSecondary?: string;
  readonly border: string;
}

export interface Palette {
  readonly id: string;
  /** Modo de color: qué esquema del sistema operativo encaja con esta paleta. */
  readonly mode: "light" | "dark";
  readonly name: string;
  readonly colors: PaletteColors;
  /** Referencia neutra del origen visual. */
  readonly reference: string;
  readonly isApproximation: boolean;
  /** Obligatoria si `isApproximation`. Enmarca el parecido en términos neutros. */
  readonly approximationNote?: string;
  /** Contraste background vs foreground, redondeado a 2 decimales. */
  readonly contrastRatio: number;
}

export const PALETTES: readonly Palette[] = [
  {
    id: "pizarra-fria",
    mode: "dark",
    name: "Pizarra Fría",
    colors: {
      background: "#0f172a",
      foreground: "#e2e8f0",
      accent: "#38bdf8",
      border: "#1e293b",
    },
    reference: "Piedra de pizarra húmeda a contraluz",
    isApproximation: false,
    contrastRatio: 14.48,
  },
  {
    id: "terracota-serena",
    mode: "light",
    name: "Terracota Serena",
    colors: {
      background: "#f4ede4",
      foreground: "#2b2320",
      accent: "#c56a4a",
      accentSecondary: "#7d8471",
      border: "#ddd0bf",
    },
    reference: "Tonos tierra de fachadas mediterráneas al sol",
    isApproximation: false,
    contrastRatio: 13.26,
  },
  {
    id: "bosque-nordico",
    mode: "dark",
    name: "Bosque Nórdico",
    colors: {
      background: "#0f1a14",
      foreground: "#dce8e0",
      accent: "#4ade80",
      border: "#1c2b22",
    },
    reference: "Pinares del norte en penumbra",
    isApproximation: false,
    contrastRatio: 14.14,
  },
  {
    id: "papel-tinta",
    mode: "light",
    name: "Papel y Tinta",
    colors: {
      background: "#faf8f3",
      foreground: "#1a1a1a",
      accent: "#b91c1c",
      border: "#e3ddd0",
    },
    reference: "Lectores de artículos de tipografía marcada sobre fondo cálido",
    isApproximation: true,
    approximationNote:
      "Combinación sobria de papel crema y tinta casi negra, en la línea de las interfaces de lectura centradas en el texto.",
    contrastRatio: 16.4,
  },
  {
    id: "medianoche-ambar",
    mode: "dark",
    name: "Medianoche Ámbar",
    colors: {
      background: "#12100e",
      foreground: "#f0e6d8",
      accent: "#f59e0b",
      border: "#26221c",
    },
    reference: "Luz de farola ámbar sobre asfalto mojado",
    isApproximation: true,
    approximationNote:
      "Modo oscuro cálido con acento ámbar, cercano al de las aplicaciones de escritura nocturna.",
    contrastRatio: 15.38,
  },
  {
    id: "niebla-costera",
    mode: "light",
    name: "Niebla Costera",
    colors: {
      background: "#eef2f3",
      foreground: "#263238",
      accent: "#0891b2",
      border: "#d4dde0",
    },
    reference: "Bruma marina al amanecer sobre roca gris",
    isApproximation: true,
    approximationNote:
      "Gris azulado aireado con acento cian, del tipo que usan las aplicaciones de productividad de tono frío.",
    contrastRatio: 11.68,
  },
  {
    id: "vino-y-piedra",
    mode: "light",
    name: "Vino y Piedra",
    colors: {
      background: "#f5f1ec",
      foreground: "#2d2424",
      accent: "#7c2d3a",
      border: "#e0d7cc",
    },
    reference: "Bodega de piedra caliza con barricas de roble",
    isApproximation: false,
    contrastRatio: 13.44,
  },
  {
    id: "acero-brutalista",
    mode: "light",
    name: "Acero Brutalista",
    colors: {
      background: "#e8e8e6",
      foreground: "#1c1c1c",
      accent: "#ea580c",
      border: "#c4c4c0",
    },
    reference: "Hormigón visto y acero galvanizado (arquitectura brutalista)",
    isApproximation: false,
    contrastRatio: 13.89,
  },
  {
    id: "jardin-japones",
    mode: "light",
    name: "Jardín Japonés",
    colors: {
      background: "#f2f0e9",
      foreground: "#2a2e28",
      accent: "#5b7553",
      border: "#dcd8cc",
    },
    reference: "Musgo húmedo y grava rastrillada",
    isApproximation: false,
    contrastRatio: 12.12,
  },
  {
    id: "tinta-china",
    mode: "light",
    name: "Tinta China",
    colors: {
      background: "#f7f5f0",
      foreground: "#14110f",
      accent: "#3f3f46",
      border: "#e6e2d8",
    },
    reference: "Caligrafía sumi-e sobre papel de arroz",
    isApproximation: false,
    contrastRatio: 17.26,
  },
  {
    id: "cobre-oxidado",
    mode: "dark",
    name: "Cobre Oxidado",
    colors: {
      background: "#1a1e1d",
      foreground: "#e4ede9",
      accent: "#2dd4bf",
      border: "#2b3230",
    },
    reference: "Pátina verdosa sobre cobre expuesto a la intemperie",
    isApproximation: false,
    contrastRatio: 14.1,
  },
  {
    id: "arena-del-desierto",
    mode: "light",
    name: "Arena del Desierto",
    colors: {
      background: "#faf3e7",
      foreground: "#3a2f22",
      accent: "#d97706",
      border: "#ecdfc9",
    },
    reference: "Dunas al mediodía",
    isApproximation: false,
    contrastRatio: 11.83,
  },
  {
    id: "lavanda-bruma",
    mode: "light",
    name: "Lavanda y Bruma",
    colors: {
      background: "#f4f2f7",
      foreground: "#2e2a35",
      accent: "#7c3aed",
      border: "#e2dcec",
    },
    reference: "Campos de lavanda en flor bajo cielo cubierto",
    isApproximation: false,
    contrastRatio: 12.6,
  },
  {
    id: "bauhaus-primario",
    mode: "light",
    name: "Bauhaus Primario",
    colors: {
      background: "#f5f4f0",
      foreground: "#18181b",
      accent: "#dc2626",
      accentSecondary: "#2563eb",
      border: "#dededa",
    },
    reference: "Geometría de color primario (movimiento Bauhaus)",
    isApproximation: false,
    contrastRatio: 16.1,
  },
  {
    id: "noche-polar",
    mode: "dark",
    name: "Noche Polar",
    colors: {
      background: "#0d1420",
      foreground: "#e5ecf4",
      accent: "#818cf8",
      border: "#1a2436",
    },
    reference: "Aurora índigo sobre campo de nieve",
    isApproximation: true,
    approximationNote:
      "Modo oscuro azul profundo con acento índigo, del tipo habitual en interfaces sociales.",
    contrastRatio: 15.5,
  },
  {
    id: "oliva-y-lino",
    mode: "light",
    name: "Oliva y Lino",
    colors: {
      background: "#f3f1e7",
      foreground: "#33352a",
      accent: "#6b7f3a",
      border: "#e0dcc9",
    },
    reference: "Tela de lino sin blanquear junto a un olivar",
    isApproximation: false,
    contrastRatio: 11.02,
  },
  {
    id: "grafito-neon",
    mode: "dark",
    name: "Grafito Neón",
    colors: {
      background: "#131315",
      foreground: "#ededf0",
      accent: "#22d3ee",
      accentSecondary: "#f472b6",
      border: "#262629",
    },
    reference: "Señalización de neón sobre muro de hormigón oscuro",
    isApproximation: true,
    approximationNote:
      "Fondo casi negro con acentos eléctricos, en la línea de los temas oscuros de herramientas de desarrollo.",
    contrastRatio: 15.88,
  },
  {
    id: "rosa-del-desierto",
    mode: "light",
    name: "Rosa del Desierto",
    colors: {
      background: "#fbf3f0",
      foreground: "#3d2a26",
      accent: "#be185d",
      border: "#f0dcd5",
    },
    reference: "Roca sedimentaria rosada pulida por el viento",
    isApproximation: false,
    contrastRatio: 12.31,
  },
  {
    id: "azulejo-portugues",
    mode: "light",
    name: "Azulejo Portugués",
    colors: {
      background: "#f6f8fb",
      foreground: "#1e293b",
      accent: "#1d4ed8",
      border: "#dbe4ee",
    },
    reference: "Cerámica vidriada azul y blanca",
    isApproximation: false,
    contrastRatio: 13.75,
  },
  {
    id: "ceniza-y-brasa",
    mode: "dark",
    name: "Ceniza y Brasa",
    colors: {
      background: "#171514",
      foreground: "#e8e2da",
      accent: "#f97316",
      border: "#2a2624",
    },
    reference: "Rescoldo de hoguera bajo la ceniza",
    isApproximation: false,
    contrastRatio: 14.15,
  },
];

const byId = new Map(PALETTES.map((palette) => [palette.id, palette]));

export function getPaletteById(id: string): Palette | undefined {
  return byId.get(id);
}

/** Recalcula el contraste real background/foreground de una paleta. */
export function paletteContrast(palette: Palette): number {
  return contrastRatio(palette.colors.background, palette.colors.foreground);
}

/** Adapta una `Palette` del catálogo a la forma de entrada de configuración (Goal 5). */
export function paletteToEntry(palette: Palette): PaletteEntry {
  const colors: Record<`--color-${string}`, string> = {
    "--color-bg": palette.colors.background,
    "--color-fg": palette.colors.foreground,
    "--color-accent": palette.colors.accent,
    "--color-border": palette.colors.border,
  };
  if (palette.colors.accentSecondary !== undefined) {
    colors["--color-accent-2"] = palette.colors.accentSecondary;
  }
  return {
    id: palette.id,
    label: palette.name,
    reference: palette.reference,
    mode: palette.mode,
    ...(palette.isApproximation ? { aprox: true } : {}),
    ...(palette.approximationNote !== undefined ? { note: palette.approximationNote } : {}),
    colors,
  };
}

/**
 * Elige una paleta curada del modo pedido (`light`/`dark`), para la
 * sincronización con el esquema de color del sistema operativo. Devuelve el id
 * actual si ya encaja, o el primero del modo deseado, o `undefined` si no hay.
 */
export function pickPaletteForMode(currentId: string, mode: "light" | "dark"): string | undefined {
  const current = getPaletteById(currentId);
  if (current && current.mode === mode) return current.id;
  return PALETTES.find((palette) => palette.mode === mode)?.id;
}

/** El catálogo de paletas en forma de entradas de configuración curadas. */
export const CURATED_PALETTES: readonly PaletteEntry[] = PALETTES.map(paletteToEntry);
