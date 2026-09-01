import { afterEach, describe, expect, it, vi } from "vitest";

import { createStorage } from "./storage";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("createStorage", () => {
  it("usa localStorage cuando está disponible", () => {
    const storage = createStorage();
    expect(storage.persistent).toBe(true);
    storage.set("k", "v");
    expect(localStorage.getItem("k")).toBe("v");
    expect(storage.get("k")).toBe("v");
    storage.remove("k");
    expect(storage.get("k")).toBeNull();
  });

  it("degrada a memoria volátil si setItem lanza (cuota / política)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    const storage = createStorage();
    expect(storage.persistent).toBe(false);
    expect(() => storage.set("k", "v")).not.toThrow();
    expect(storage.get("k")).toBe("v"); // se guardó en memoria
  });

  it("nunca lanza en get aunque getItem falle", () => {
    const storage = createStorage();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    expect(() => storage.get("k")).not.toThrow();
    expect(storage.get("k")).toBeNull();
  });
});
