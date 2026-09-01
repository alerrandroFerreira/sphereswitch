import { afterEach, describe, expect, it } from "vitest";

import { CURATED_FONTS, FONT_PAIRS, fontPairToEntry, getFontPairById } from "./fonts";
import type { FontFace, FontPair } from "./fonts";
import { applyFontPair, fontshareHref, getFontPairHrefs, googleFontsHref } from "./fontLoader";

const MIXED_PAIR: FontPair = {
  id: "mixto-de-prueba",
  name: "Mixto",
  displayFont: { family: "Zodiak", source: "fontshare", weights: [400], fallback: "serif" },
  bodyFont: { family: "Inter", source: "google-fonts", weights: [400], fallback: "sans-serif" },
  isApproximation: false,
  license: "test",
};

const VALID_SOURCES = new Set(["google-fonts", "fontshare"]);

function checkFace(face: FontFace): void {
  expect(face.family.length).toBeGreaterThan(0);
  expect(VALID_SOURCES.has(face.source)).toBe(true);
  expect(face.weights.length).toBeGreaterThan(0);
  expect(face.weights.every((w) => Number.isInteger(w) && w >= 100 && w <= 900)).toBe(true);
  expect(face.fallback.length).toBeGreaterThan(0);
}

describe("catálogo FONT_PAIRS", () => {
  it("tiene 24 parejas, todas curadas", () => {
    expect(FONT_PAIRS).toHaveLength(24);
  });

  it("no repite ningún id", () => {
    const ids = FONT_PAIRS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada entrada tiene la forma completa", () => {
    for (const pair of FONT_PAIRS) {
      expect(pair.id).toMatch(/^[a-z0-9-]+$/);
      expect(pair.name.length).toBeGreaterThan(0);
      expect(pair.license.length).toBeGreaterThan(0);
      checkFace(pair.displayFont);
      checkFace(pair.bodyFont);
    }
  });

  it("toda aproximación lleva inspiredBy y approximationNote; el resto no", () => {
    for (const pair of FONT_PAIRS) {
      if (pair.isApproximation) {
        expect(pair.inspiredBy, pair.id).toBeTruthy();
        expect(pair.approximationNote, pair.id).toBeTruthy();
        expect(pair.approximationNote).not.toMatch(/la misma fuente|idéntic|igual de buena/i);
      } else {
        expect(pair.inspiredBy, pair.id).toBeUndefined();
        expect(pair.approximationNote, pair.id).toBeUndefined();
      }
    }
  });

  it("hay tanto aproximaciones como parejas abiertas puras", () => {
    const approx = FONT_PAIRS.filter((p) => p.isApproximation).length;
    expect(approx).toBeGreaterThan(0);
    expect(approx).toBeLessThan(FONT_PAIRS.length);
  });

  it("getFontPairById localiza y falla con gracia", () => {
    expect(getFontPairById("canela")?.name).toBe("Fraunces & Inter");
    expect(getFontPairById("inexistente")).toBeUndefined();
  });
});

describe("fontPairToEntry / CURATED_FONTS", () => {
  it("produce entradas de configuración válidas con variables de la convención", () => {
    const entry = fontPairToEntry(getFontPairById("canela")!);
    expect(entry.id).toBe("canela");
    expect(entry.aprox).toBe(true);
    expect(Object.keys(entry.fonts)).toEqual(["--font-display", "--font-body"]);
  });

  it("CURATED_FONTS cubre todo el catálogo", () => {
    expect(CURATED_FONTS).toHaveLength(FONT_PAIRS.length);
  });
});

describe("carga perezosa", () => {
  it("googleFontsHref construye la URL css2 esperada", () => {
    const href = googleFontsHref([
      { family: "Space Grotesk", source: "google-fonts", weights: [500, 400], fallback: "x" },
    ]);
    expect(href).toBe(
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&display=swap",
    );
  });

  it("fontshareHref construye la URL de la API de Fontshare", () => {
    const href = fontshareHref([
      { family: "Switzer", source: "fontshare", weights: [600, 400], fallback: "x" },
    ]);
    expect(href).toBe("https://api.fontshare.com/v2/css?f[]=switzer@400,600&display=swap");
  });

  it("una pareja de un solo proveedor genera un solo href", () => {
    expect(getFontPairHrefs(getFontPairById("canela")!)).toHaveLength(1);
  });

  it("una pareja con proveedores mixtos genera un href por proveedor", () => {
    expect(getFontPairHrefs(MIXED_PAIR)).toHaveLength(2);
  });

  it("applyFontPair inyecta los link y retira los de la pareja anterior", () => {
    applyFontPair(getFontPairById("canela")!);
    expect(document.querySelectorAll("link[data-sphereswitch-font]")).toHaveLength(1);

    applyFontPair(MIXED_PAIR);
    const links = document.querySelectorAll("link[data-sphereswitch-font]");
    expect(links).toHaveLength(2);
    expect(
      [...links].every((l) => l.getAttribute("data-sphereswitch-font") === "mixto-de-prueba"),
    ).toBe(true);
  });
});

afterEach(() => {
  document.querySelectorAll("link[data-sphereswitch-font]").forEach((l) => {
    l.remove();
  });
});
