import { beforeEach, describe, expect, it } from "vitest";

import { comboKey } from "./comboNames";
import { createRejectedCombos } from "./rejectedCombos";

const combo = { font: "a", palette: "x", layout: "l1" };

beforeEach(() => {
  localStorage.clear();
});

describe("createRejectedCombos", () => {
  it("marca y consulta combinaciones descartadas", () => {
    const rejected = createRejectedCombos();
    expect(rejected.isRejected(combo)).toBe(false);
    rejected.reject(combo);
    expect(rejected.isRejected(combo)).toBe(true);
    rejected.unreject(combo);
    expect(rejected.isRejected(combo)).toBe(false);
  });

  it("usa el mismo esquema de hash de combo que los nombres automáticos", () => {
    createRejectedCombos().reject(combo);
    const stored = JSON.parse(localStorage.getItem("sphereswitch:rejected") ?? "[]") as string[];
    expect(stored).toContain(comboKey(combo));
  });

  it("persiste entre instancias", () => {
    createRejectedCombos().reject(combo);
    expect(createRejectedCombos().isRejected(combo)).toBe(true);
  });
});
