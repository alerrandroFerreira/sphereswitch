import { describe, expect, it } from "vitest";

import { hexToFigmaRgb, isColorToken, tokenToVariableName } from "./tokens";

describe("hexToFigmaRgb", () => {
  it("convierte a componentes 0..1", () => {
    expect(hexToFigmaRgb("#ffffff")).toEqual({ r: 1, g: 1, b: 1 });
    expect(hexToFigmaRgb("#000")).toEqual({ r: 0, g: 0, b: 0 });
    const mid = hexToFigmaRgb("#808080");
    expect(mid.r).toBeCloseTo(128 / 255, 5);
  });
});

describe("tokenToVariableName", () => {
  it("mapea la variable CSS al nombre de variable de Figma", () => {
    expect(tokenToVariableName("--color-bg")).toBe("color/bg");
    expect(tokenToVariableName("--font-display")).toBe("font/display");
    expect(tokenToVariableName("--color-accent-2")).toBe("color/accent-2");
  });
});

describe("isColorToken", () => {
  it("distingue tokens de color de los de fuente", () => {
    expect(isColorToken("--color-bg")).toBe(true);
    expect(isColorToken("--font-body")).toBe(false);
  });
});
