import { describe, expect, it } from "vitest";

import { hexToRgb } from "@sphereswitch/core";
import type { Rgb } from "@sphereswitch/core";
import { kmeansPalette } from "./imagePalette";

function dominantChannel(hex: string): "r" | "g" | "b" {
  const { r, g, b } = hexToRgb(hex);
  if (r >= g && r >= b) return "r";
  return g >= b ? "g" : "b";
}

function cluster(center: Rgb, n: number): Rgb[] {
  return Array.from({ length: n }, (_, i) => ({
    r: center.r + (i % 3),
    g: center.g + (i % 2),
    b: center.b + (i % 4),
  }));
}

describe("kmeansPalette", () => {
  it("recupera los colores dominantes de clusters bien separados", () => {
    const pixels = [
      ...cluster({ r: 240, g: 20, b: 20 }, 60),
      ...cluster({ r: 20, g: 200, b: 40 }, 40),
      ...cluster({ r: 30, g: 40, b: 220 }, 20),
    ];
    const palette = kmeansPalette(pixels, 3);
    expect(palette).toHaveLength(3);
    // recupera un color por cluster (rojo, verde, azul), en cualquier orden
    expect(new Set(palette.map(dominantChannel))).toEqual(new Set(["r", "g", "b"]));
    // el cluster más grande (rojo, 60 px) va primero
    expect(dominantChannel(palette[0]!)).toBe("r");
  });

  it("no devuelve más colores que píxeles", () => {
    expect(kmeansPalette([{ r: 10, g: 10, b: 10 }], 5)).toHaveLength(1);
  });

  it("con lista vacía devuelve []", () => {
    expect(kmeansPalette([], 5)).toEqual([]);
  });

  it("es determinista para la misma entrada", () => {
    const pixels = cluster({ r: 100, g: 100, b: 100 }, 30);
    expect(kmeansPalette(pixels, 3)).toEqual(kmeansPalette(pixels, 3));
  });
});
