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

export type ExportFormat = "css" | "tailwind" | "json";

function stripPrefix(key: string): string {
  return key.replace(/^--(color|font)-/, "");
}

function generateTailwind(input: Omit<CssBlockInput, "selector">): string {
  const colors: Record<string, string> = {};
  for (const key of Object.keys(input.palette?.colors ?? {})) {
    colors[stripPrefix(key)] = `var(${key})`;
  }
  const fontFamily: Record<string, string[]> = {};
  for (const key of Object.keys(input.font?.fonts ?? {})) {
    fontFamily[stripPrefix(key)] = [`var(${key})`];
  }
  const theme = { extend: { colors, fontFamily } };
  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: ${JSON.stringify(
    theme,
    null,
    2,
  )
    .split("\n")
    .join("\n  ")},\n};`;
}

/**
 * La misma combinación en varios formatos de salida. `css` reproduce
 * exactamente `generateCssBlock`; no hay dos generadores para lo mismo.
 */
export function generateExport(
  input: Omit<CssBlockInput, "selector"> & { readonly selector?: string },
  format: ExportFormat,
): string {
  switch (format) {
    case "css":
      return generateCssBlock(input);
    case "json":
      return JSON.stringify(generateTokenMap(input), null, 2);
    case "tailwind":
      return generateTailwind(input);
  }
}
