// Generación del bloque de custom properties CSS para la combinación activa
// (fuente + paleta). Fuente ÚNICA: la consola de código de Monaco (Goal 13) y
// la exportación a otras herramientas (Goal 17) usan este mismo generador, no
// dos distintos para el mismo propósito.

import type { FontPairEntry, PaletteEntry } from "../config";

export interface CssBlockInput {
  readonly palette?: PaletteEntry;
  readonly font?: FontPairEntry;
  /** Selector del bloque. Por defecto `:root`. */
  readonly selector?: string;
}

/** Bloque `selector { --custom-prop: valor; … }` con las variables activas. */
export function generateCssBlock(input: CssBlockInput): string {
  const selector = input.selector ?? ":root";
  const lines: string[] = [];

  if (input.font) {
    for (const [key, value] of Object.entries(input.font.fonts)) {
      lines.push(`  ${key}: ${value};`);
    }
  }
  if (input.palette) {
    for (const [key, value] of Object.entries(input.palette.colors)) {
      lines.push(`  ${key}: ${value};`);
    }
  }

  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** Los mismos tokens como objeto plano `{ "--color-bg": "#…" }`, para exportar a JSON. */
export function generateTokenMap(input: Omit<CssBlockInput, "selector">): Record<string, string> {
  return {
    ...(input.font?.fonts ?? {}),
    ...(input.palette?.colors ?? {}),
  };
}
