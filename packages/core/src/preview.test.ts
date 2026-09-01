import { describe, expect, it } from "vitest";

import { parsePreviewValue, serializePreviewValue } from "./preview";

describe("parsePreviewValue", () => {
  it("parsea pares dimensión:valor separados por coma", () => {
    expect(parsePreviewValue("palette:terracota-serena,font:canela")).toEqual({
      palette: "terracota-serena",
      font: "canela",
    });
  });

  it("ignora entradas mal formadas y devuelve {} para vacío", () => {
    expect(parsePreviewValue("")).toEqual({});
    expect(parsePreviewValue(null)).toEqual({});
    expect(parsePreviewValue("suelto,:sinclave,clave:,ok:bien")).toEqual({ ok: "bien" });
  });
});

describe("serializePreviewValue", () => {
  it("es el inverso de parsePreviewValue", () => {
    const combo = { palette: "x", font: "y", layout: "z" };
    expect(parsePreviewValue(serializePreviewValue(combo))).toEqual(combo);
  });

  it("omite valores vacíos", () => {
    expect(serializePreviewValue({ palette: "x", font: "" })).toBe("palette:x");
  });
});
