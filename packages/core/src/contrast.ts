// Único punto de verdad del cálculo de contraste WCAG en todo el proyecto:
// lo usan el catálogo curado (Goal 8), el comparador de legibilidad y la
// simulación de daltonismo (Goal 16). Sin dependencias.

export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Convierte componentes 0–255 a `#rrggbb`. */
export function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (n: number): string =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}

/** Convierte `#rgb` o `#rrggbb` a componentes 0–255. Lanza si el formato no es válido. */
export function hexToRgb(hex: string): Rgb {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`[sphereswitch] Color hex no válido: "${hex}".`);
  }
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa WCAG (0–1). */
export function relativeLuminance(color: Rgb | string): number {
  const { r, g, b } = typeof color === "string" ? hexToRgb(color) : color;
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** Ratio de contraste WCAG entre dos colores (1–21). */
export function contrastRatio(a: Rgb | string, b: Rgb | string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA para texto normal: ratio ≥ 4.5:1. */
export const WCAG_AA_NORMAL = 4.5;

/** WCAG AAA para texto normal: ratio ≥ 7:1. */
export const WCAG_AAA_NORMAL = 7;

export function meetsWcagAa(a: Rgb | string, b: Rgb | string): boolean {
  return contrastRatio(a, b) >= WCAG_AA_NORMAL;
}

export function meetsWcagAaa(a: Rgb | string, b: Rgb | string): boolean {
  return contrastRatio(a, b) >= WCAG_AAA_NORMAL;
}
