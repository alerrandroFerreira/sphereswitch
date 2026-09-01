import { describe, expect, it } from "vitest";

import { generateCssBlock, generateExport, generateTokenMap } from "./codegen";
import { fontPairToEntry, getFontPairById } from "./fonts";
import { getPaletteById, paletteToEntry } from "./palettes";

const font = fontPairToEntry(getFontPairById("canela")!);
const palette = paletteToEntry(getPaletteById("tinta-china")!);

describe("generateCssBlock", () => {
  it("produce un bloque :root con las variables de fuente y paleta activas", () => {
    const css = generateCssBlock({ font, palette });
    expect(css.startsWith(":root {")).toBe(true);
    expect(css).toContain("--font-display:");
    expect(css).toContain("--color-bg:");
    expect(css.trimEnd().endsWith("}")).toBe(true);
  });

  it("respeta un selector personalizado", () => {
    expect(
      generateCssBlock({ palette, selector: "[data-theme]" }).startsWith("[data-theme] {"),
    ).toBe(true);
  });

  it("con solo fuente o solo paleta, no incluye la otra", () => {
    expect(generateCssBlock({ font })).not.toContain("--color-");
    expect(generateCssBlock({ palette })).not.toContain("--font-");
  });

  it("es determinista: dos llamadas con la misma entrada dan el mismo texto", () => {
    expect(generateCssBlock({ font, palette })).toBe(generateCssBlock({ font, palette }));
  });
});

describe("generateTokenMap", () => {
  it("devuelve las mismas variables como objeto plano", () => {
    const map = generateTokenMap({ font, palette });
    expect(map["--color-bg"]).toBe(palette.colors["--color-bg"]);
    expect(map["--font-display"]).toBe(font.fonts["--font-display"]);
  });
});

describe("generateExport", () => {
  it("el formato css reproduce exactamente generateCssBlock (mismo generador)", () => {
    expect(generateExport({ font, palette }, "css")).toBe(generateCssBlock({ font, palette }));
  });

  it("el formato json es un objeto de tokens parseable", () => {
    const parsed = JSON.parse(generateExport({ font, palette }, "json")) as Record<string, string>;
    expect(parsed["--color-bg"]).toBe(palette.colors["--color-bg"]);
  });

  it("el formato tailwind mapea los tokens a theme.extend con var()", () => {
    const out = generateExport({ font, palette }, "tailwind");
    expect(out).toContain("module.exports");
    expect(out).toContain('"bg": "var(--color-bg)"');
    expect(out).toContain('"display": [');
  });
});
