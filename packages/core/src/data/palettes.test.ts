import { describe, expect, it } from "vitest";

import { contrastRatio, hexToRgb, meetsWcagAa } from "./color";
import {
  CURATED_PALETTES,
  PALETTES,
  getPaletteById,
  paletteContrast,
  paletteToEntry,
} from "./palettes";

describe("utilidades de color", () => {
  it("hexToRgb admite forma corta y larga y rechaza basura", () => {
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(() => hexToRgb("#12")).toThrow();
  });

  it("contrastRatio conocido: negro sobre blanco = 21", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });
});

describe("catálogo PALETTES", () => {
  it("tiene 20 paletas sin ids repetidos", () => {
    expect(PALETTES).toHaveLength(20);
    const ids = PALETTES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada entrada tiene la forma completa", () => {
    for (const palette of PALETTES) {
      expect(palette.id).toMatch(/^[a-z0-9-]+$/);
      expect(palette.name.length).toBeGreaterThan(0);
      expect(palette.reference.length).toBeGreaterThan(0);
      for (const key of ["background", "foreground", "accent", "border"] as const) {
        expect(palette.colors[key], `${palette.id}.${key}`).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  it("las referencias no nombran marcas: sin patrón 'de [Marca]'", () => {
    for (const palette of PALETTES) {
      expect(palette.reference).not.toMatch(/inspirad[ao] en los colores de/i);
    }
  });

  it("toda aproximación lleva approximationNote; el resto no", () => {
    for (const palette of PALETTES) {
      if (palette.isApproximation) {
        expect(palette.approximationNote, palette.id).toBeTruthy();
      } else {
        expect(palette.approximationNote, palette.id).toBeUndefined();
      }
    }
  });

  it("cada paleta cumple WCAG AA — contraste recalculado, no de fiar del dato", () => {
    for (const palette of PALETTES) {
      const real = paletteContrast(palette);
      expect(real, `${palette.id} por debajo de AA`).toBeGreaterThanOrEqual(4.5);
      // el valor guardado coincide con el real
      expect(palette.contrastRatio, `${palette.id} contrastRatio desincronizado`).toBeCloseTo(
        real,
        1,
      );
      expect(meetsWcagAa(palette.colors.background, palette.colors.foreground)).toBe(true);
    }
  });

  it("getPaletteById localiza y falla con gracia", () => {
    expect(getPaletteById("tinta-china")?.name).toBe("Tinta China");
    expect(getPaletteById("inexistente")).toBeUndefined();
  });

  it("hay tanto aproximaciones como paletas originales", () => {
    const approx = PALETTES.filter((p) => p.isApproximation).length;
    expect(approx).toBeGreaterThan(0);
    expect(approx).toBeLessThan(PALETTES.length);
  });
});

describe("paletteToEntry / CURATED_PALETTES", () => {
  it("usa las variables CSS de la convención", () => {
    const entry = paletteToEntry(getPaletteById("bauhaus-primario")!);
    expect(Object.keys(entry.colors)).toEqual([
      "--color-bg",
      "--color-fg",
      "--color-accent",
      "--color-border",
      "--color-accent-2",
    ]);
    expect(entry.reference).toBeTruthy();
  });

  it("marca aprox solo cuando corresponde", () => {
    expect(paletteToEntry(getPaletteById("papel-tinta")!).aprox).toBe(true);
    expect(paletteToEntry(getPaletteById("tinta-china")!).aprox).toBeUndefined();
  });

  it("CURATED_PALETTES cubre todo el catálogo", () => {
    expect(CURATED_PALETTES).toHaveLength(PALETTES.length);
  });
});
