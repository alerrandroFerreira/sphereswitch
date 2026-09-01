import { afterEach, describe, expect, it, vi } from "vitest";

import {
  defineConfig,
  isFontPairEntry,
  isPaletteEntry,
  resolveCatalog,
  resolveStoreConfig,
} from "./config";
import type { CuratedCatalog, PaletteEntry } from "./config";

const curated: CuratedCatalog = {
  palettes: [
    { id: "slate", colors: { "--color-bg": "#0f172a" } },
    { id: "terracota", colors: { "--color-bg": "#f4ede4" } },
  ],
  fonts: [{ id: "sans", fonts: { "--font-body": "Inter" } }],
  layouts: [{ id: "bento" }, { id: "editorial" }],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineConfig", () => {
  it("devuelve el mismo objeto que recibe", () => {
    const input = { palettes: [] };
    expect(defineConfig(input)).toBe(input);
  });
});

describe("guards de validación", () => {
  it("acepta una entrada de paleta bien formada", () => {
    expect(isPaletteEntry({ id: "x", colors: { "--color-bg": "#000" } })).toBe(true);
  });

  it("rechaza colores sin el prefijo de la convención", () => {
    expect(isPaletteEntry({ id: "x", colors: { bg: "#000" } })).toBe(false);
  });

  it("rechaza entradas sin id", () => {
    expect(isPaletteEntry({ colors: { "--color-bg": "#000" } })).toBe(false);
    expect(isFontPairEntry({ fonts: { "--font-body": "Inter" } })).toBe(false);
  });
});

describe("resolveCatalog", () => {
  it("sin config de usuario devuelve el catálogo curado tal cual", () => {
    expect(resolveCatalog(undefined, curated).palettes.map((p) => p.id)).toEqual([
      "slate",
      "terracota",
    ]);
  });

  it("extend suma al catálogo curado", () => {
    const result = resolveCatalog(
      { palettes: { extend: [{ id: "custom", colors: { "--color-bg": "#fff" } }] } },
      curated,
    );
    expect(result.palettes.map((p) => p.id)).toEqual(["slate", "terracota", "custom"]);
  });

  it("un array suelto equivale a extend", () => {
    const result = resolveCatalog({ layouts: [{ id: "brutalist" }] }, curated);
    expect(result.layouts.map((l) => l.id)).toEqual(["bento", "editorial", "brutalist"]);
  });

  it("replace descarta el catálogo curado de esa dimensión", () => {
    const result = resolveCatalog(
      { palettes: { replace: [{ id: "only", colors: { "--color-bg": "#fff" } }] } },
      curated,
    );
    expect(result.palettes.map((p) => p.id)).toEqual(["only"]);
    // las demás dimensiones no se tocan
    expect(result.fonts.map((f) => f.id)).toEqual(["sans"]);
  });

  it("el usuario pisa una entrada curada con el mismo id", () => {
    const override: PaletteEntry = { id: "slate", colors: { "--color-bg": "#123456" } };
    const result = resolveCatalog({ palettes: { extend: [override] } }, curated);
    expect(result.palettes.find((p) => p.id === "slate")).toBe(override);
    expect(result.palettes).toHaveLength(2);
  });

  it("descarta entradas inválidas con un aviso, sin lanzar", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = resolveCatalog(
      { palettes: { extend: [{ id: "malo" } as unknown as PaletteEntry] } },
      curated,
    );
    expect(result.palettes.map((p) => p.id)).toEqual(["slate", "terracota"]);
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe("resolveStoreConfig", () => {
  it("deriva dimensiones con los ids como valores", () => {
    const store = resolveStoreConfig(resolveCatalog(undefined, curated));
    const palette = store.dimensions.find((d) => d.name === "palette");
    expect(palette).toEqual({
      name: "palette",
      values: ["slate", "terracota"],
      defaultValue: "slate",
    });
  });

  it("respeta el defecto indicado si está entre los valores", () => {
    const store = resolveStoreConfig(resolveCatalog(undefined, curated), { palette: "terracota" });
    expect(store.dimensions.find((d) => d.name === "palette")?.defaultValue).toBe("terracota");
  });

  it("ignora un defecto que no existe y usa el primero", () => {
    const store = resolveStoreConfig(resolveCatalog(undefined, curated), { palette: "fantasma" });
    expect(store.dimensions.find((d) => d.name === "palette")?.defaultValue).toBe("slate");
  });

  it("una dimensión vacía degrada a un único valor neutro", () => {
    const store = resolveStoreConfig({ palettes: [], fonts: [], layouts: [] });
    expect(store.dimensions.find((d) => d.name === "palette")).toEqual({
      name: "palette",
      values: ["default"],
      defaultValue: "default",
    });
  });

  it("el resultado es una configuración válida para createStore", async () => {
    const { createStore } = await import("./store");
    const store = createStore(resolveStoreConfig(resolveCatalog(undefined, curated)));
    expect(store.get("layout")).toBe("bento");
    store.set("layout", "editorial");
    expect(store.get("layout")).toBe("editorial");
    store.destroy();
  });
});
