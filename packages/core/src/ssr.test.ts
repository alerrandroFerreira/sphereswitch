import { describe, expect, it } from "vitest";

import { getServerState } from "./ssr";
import type { SphereSwitchConfig } from "./types";

const config: SphereSwitchConfig = {
  dimensions: [
    { name: "font", values: ["sans", "serif"], defaultValue: "serif" },
    { name: "palette", values: ["slate", "terracotta"], defaultValue: "slate" },
  ],
};

describe("getServerState", () => {
  it("devuelve el estado por defecto derivado de la configuración", () => {
    expect(getServerState(config)).toEqual({ font: "serif", palette: "slate" });
  });

  it("devuelve un objeto congelado", () => {
    expect(Object.isFrozen(getServerState(config))).toBe(true);
  });

  it("no lee localStorage aunque haya algo guardado", () => {
    localStorage.setItem("sphereswitch:font", "sans");
    expect(getServerState(config).font).toBe("serif");
    localStorage.clear();
  });
});
