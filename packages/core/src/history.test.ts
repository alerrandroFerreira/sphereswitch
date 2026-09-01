import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createStore } from "./store";
import { createHistory } from "./history";
import type { SphereSwitchConfig } from "./types";

const config: SphereSwitchConfig = {
  dimensions: [
    { name: "font", values: ["a", "b", "c"], defaultValue: "a" },
    { name: "palette", values: ["x", "y", "z"], defaultValue: "x" },
    { name: "layout", values: ["l1", "l2"], defaultValue: "l1" },
  ],
};

let store: ReturnType<typeof createStore>;

beforeEach(() => {
  localStorage.clear();
  store = createStore(config);
});

afterEach(() => {
  store.destroy();
});

describe("createHistory — cursor", () => {
  it("captura el estado inicial como primera entrada", () => {
    const history = createHistory(store);
    expect(history.entries()).toHaveLength(1);
    expect(history.entries()[0]).toMatchObject({ font: "a", palette: "x", layout: "l1" });
    expect(history.canUndo()).toBe(false);
    history.destroy();
  });

  it("registra cada cambio y permite deshacer y rehacer", () => {
    const history = createHistory(store);
    store.set("palette", "y");
    store.set("font", "b");
    expect(history.entries()).toHaveLength(3);

    expect(history.undo()).toBe(true);
    expect(store.get("font")).toBe("a");
    expect(store.get("palette")).toBe("y");

    expect(history.undo()).toBe(true);
    expect(store.get("palette")).toBe("x");

    expect(history.redo()).toBe(true);
    expect(store.get("palette")).toBe("y");

    history.destroy();
  });

  it("un cambio nuevo tras deshacer trunca el futuro", () => {
    const history = createHistory(store);
    store.set("palette", "y");
    store.set("palette", "z");
    history.undo(); // vuelve a "y"
    expect(history.canRedo()).toBe(true);

    store.set("font", "c"); // cambio nuevo desde "y"
    expect(history.canRedo()).toBe(false);
    expect(history.entries().map((e) => e.palette)).toEqual(["x", "y", "y"]);
    expect(history.entries().at(-1)).toMatchObject({ font: "c", palette: "y" });

    history.destroy();
  });

  it("deshacer no se registra a sí mismo como entrada nueva", () => {
    const history = createHistory(store);
    store.set("palette", "y");
    const before = history.entries().length;
    history.undo();
    history.redo();
    expect(history.entries().length).toBe(before);
    history.destroy();
  });

  it("no crea entradas duplicadas si el combo no cambia", () => {
    const history = createHistory(store);
    store.set("palette", "x"); // ya era "x"
    expect(history.entries()).toHaveLength(1);
    history.destroy();
  });
});

describe("createHistory — límite de 50", () => {
  it("expulsa las entradas más antiguas al superar el máximo", () => {
    const history = createHistory(store, { max: 5 });
    for (const value of ["y", "z", "y", "z", "y", "z", "y"]) store.set("palette", value);
    expect(history.entries()).toHaveLength(5);
    history.destroy();
  });
});

describe("createHistory — persistencia", () => {
  it("usa una clave de almacenamiento separada del estado actual", () => {
    const history = createHistory(store);
    store.set("palette", "y");
    expect(localStorage.getItem("sphereswitch:history")).not.toBeNull();
    expect(localStorage.getItem("sphereswitch:palette")).toBe("y");
    history.destroy();
  });

  it("rehidrata entradas y cursor de una sesión anterior", () => {
    const first = createHistory(store);
    store.set("palette", "y");
    store.set("layout", "l2");
    first.undo();
    first.destroy();

    const store2 = createStore(config);
    const second = createHistory(store2);
    expect(second.entries()).toHaveLength(3);
    expect(second.canRedo()).toBe(true);
    second.destroy();
    store2.destroy();
  });
});
