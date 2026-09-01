import { beforeEach, describe, expect, it } from "vitest";

import { COMBO_ADJECTIVES, createComboNamer } from "./comboNames";

beforeEach(() => {
  localStorage.clear();
});

describe("createComboNamer", () => {
  it("genera <paleta> <adjetivo curado> #<n>", () => {
    const namer = createComboNamer();
    const name = namer.nameFor(
      { font: "a", palette: "terracota-serena", layout: "bento" },
      "Terracota Serena",
    );
    expect(name).toMatch(/^Terracota Serena \S+ #1$/);
    const adjective = name.split(" ").at(-2);
    expect(COMBO_ADJECTIVES).toContain(adjective as (typeof COMBO_ADJECTIVES)[number]);
  });

  it("la misma combinación siempre recibe el mismo nombre", () => {
    const namer = createComboNamer();
    const combo = { font: "a", palette: "x", layout: "l1" };
    const first = namer.nameFor(combo, "Equis");
    const second = namer.nameFor(combo, "Equis");
    expect(first).toBe(second);
  });

  it("el número secuencial no se reutiliza aunque cambien las combinaciones", () => {
    const namer = createComboNamer();
    const n1 = namer.nameFor({ font: "a", palette: "x", layout: "l1" }, "X");
    const n2 = namer.nameFor({ font: "b", palette: "y", layout: "l1" }, "Y");
    const n3 = namer.nameFor({ font: "c", palette: "z", layout: "l1" }, "Z");
    expect([n1, n2, n3].map((n) => n.split("#")[1])).toEqual(["1", "2", "3"]);
  });

  it("sobrevive entre instancias (persistido en localStorage)", () => {
    const combo = { font: "a", palette: "x", layout: "l1" };
    const first = createComboNamer().nameFor(combo, "X");
    const again = createComboNamer().nameFor(combo, "X");
    expect(again).toBe(first);
    // y el contador sigue avanzando desde donde estaba
    const next = createComboNamer().nameFor({ font: "z", palette: "z", layout: "z" }, "Z");
    expect(next.endsWith("#2")).toBe(true);
  });
});
