import { describe, expect, it } from "vitest";

import { COLOR_VISION_TYPES, colorVisionMatrix } from "./colorVision";

describe("colorVisionMatrix", () => {
  it("devuelve 20 valores (feColorMatrix 4×5) para cada tipo", () => {
    for (const type of COLOR_VISION_TYPES) {
      const values = colorVisionMatrix(type);
      expect(values).toHaveLength(20);
      expect(values.every((n) => typeof n === "number" && Number.isFinite(n))).toBe(true);
    }
  });

  it("deja el canal alfa intacto (última fila = 0 0 0 1 0)", () => {
    expect(colorVisionMatrix("deuteranopia").slice(15)).toEqual([0, 0, 0, 1, 0]);
  });

  it("cubre exactamente protanopia, deuteranopia y tritanopia", () => {
    expect([...COLOR_VISION_TYPES]).toEqual(["protanopia", "deuteranopia", "tritanopia"]);
  });
});
