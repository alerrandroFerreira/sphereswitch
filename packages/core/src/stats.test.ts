import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createStore } from "./store";
import { createUsageStats } from "./stats";
import type { SphereSwitchConfig } from "./types";

const config: SphereSwitchConfig = {
  dimensions: [
    { name: "font", values: ["a", "b"], defaultValue: "a" },
    { name: "palette", values: ["x", "y"], defaultValue: "x" },
    { name: "layout", values: ["l1"], defaultValue: "l1" },
  ],
};

let store: ReturnType<typeof createStore>;

beforeEach(async () => {
  localStorage.clear();
  store = createStore(config);
});

afterEach(async () => {
  const stats = createUsageStats(store);
  await stats.clear();
  stats.destroy();
  store.destroy();
});

describe("createUsageStats (IndexedDB)", () => {
  it("registra una sesión por cada combinación activada y las agrega", async () => {
    const stats = createUsageStats(store);

    store.set("palette", "y");
    store.set("palette", "x");
    store.set("palette", "y");

    const summary = await stats.summary();
    // 3 sesiones cerradas: x->y, y->x, x->y  (más la abierta, que flush cierra)
    const total = summary.reduce((sum, entry) => sum + entry.count, 0);
    expect(total).toBeGreaterThanOrEqual(3);
    expect(summary[0]?.totalMs).toBeGreaterThanOrEqual(0);

    stats.destroy();
  });

  it("summary sale ordenado de más a menos tiempo activo", async () => {
    const stats = createUsageStats(store);
    store.set("palette", "y");
    const summary = await stats.summary();
    for (let i = 1; i < summary.length; i += 1) {
      expect(summary[i - 1]!.totalMs).toBeGreaterThanOrEqual(summary[i]!.totalMs);
    }
    stats.destroy();
  });

  it("clear() borra el histórico persistido (queda solo la sesión en curso)", async () => {
    const stats = createUsageStats(store);
    store.set("palette", "y");
    store.set("palette", "x");
    await stats.flush();
    await stats.clear();
    const summary = await stats.summary();
    // solo la combinación activa ahora mismo, con una única sesión abierta
    expect(summary).toHaveLength(1);
    expect(summary[0]?.count).toBe(1);
    stats.destroy();
  });
});
