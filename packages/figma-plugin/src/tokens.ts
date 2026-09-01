// Helpers puros para traducir los tokens de SphereSwitch a la API de Figma.
// Separados de code.ts para poder testearlos sin el sandbox de Figma.

export interface FigmaRgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** `#rrggbb` / `#rgb` -> componentes 0..1 que espera la API de Figma. */
export function hexToFigmaRgb(hex: string): FigmaRgb {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}

/** `--color-bg` -> `color/bg`, `--font-display` -> `font/display`. */
export function tokenToVariableName(token: string): string {
  return token.replace(/^--/, "").replace(/-/, "/");
}

export function isColorToken(token: string): boolean {
  return token.startsWith("--color-");
}
