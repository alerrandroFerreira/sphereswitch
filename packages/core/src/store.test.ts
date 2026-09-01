import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createStore } from "./store";
import type { SphereSwitchChangeDetail, SphereSwitchConfig } from "./types";

const config: SphereSwitchConfig = {
  dimensions: [
    { name: "font", values: ["sans", "serif", "mono"], defaultValue: "sans" },
    { name: "palette", values: ["slate", "terracotta"], defaultValue: "slate" },
    { name: "layout", values: ["bento", "editorial"], defaultValue: "bento" },
  ],
};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.getAttributeNames().forEach((name) => {
    if (name.startsWith("data-sphereswitch-")) document.documentElement.removeAttribute(name);
  });
});

describe("createStore — configuración", () => {
  it("rechaza una configuración sin dimensiones", () => {
    expect(() => createStore({ dimensions: [] })).toThrow(/al menos una dimensión/);
  });

  it("rechaza dimensiones duplicadas", () => {
    expect(() =>
      createStore({
        dimensions: [
          { name: "font", values: ["a"], defaultValue: "a" },
          { name: "font", values: ["b"], defaultValue: "b" },
        ],
      }),
    ).toThrow(/duplicada/);
  });

  it("rechaza un valor por defecto fuera de la lista de valores", () => {
    expect(() =>
      createStore({ dimensions: [{ name: "font", values: ["a", "b"], defaultValue: "c" }] }),
    ).toThrow(/valor por defecto/);
  });
});

describe("createStore — estado y persistencia", () => {
  it("arranca en los valores por defecto cuando no hay nada guardado", () => {
    const store = createStore(config);
    expect(store.getState()).toEqual({ font: "sans", palette: "slate", layout: "bento" });
  });

  it("hidrata desde localStorage", () => {
    localStorage.setItem("sphereswitch:palette", "terracotta");
    const store = createStore(config);
    expect(store.get("palette")).toBe("terracotta");
  });

  it("cae al valor por defecto si el valor guardado no es válido", () => {
    localStorage.setItem("sphereswitch:font", "comic-sans");
    const store = createStore(config);
    expect(store.get("font")).toBe("sans");
  });

  it("persiste el cambio con la clave namespaced", () => {
    const store = createStore(config);
    store.set("font", "mono");
    expect(localStorage.getItem("sphereswitch:font")).toBe("mono");
  });

  it("escribe el atributo data-* en el elemento raíz", () => {
    const store = createStore(config);
    store.set("palette", "terracotta");
    expect(document.documentElement.getAttribute("data-sphereswitch-palette")).toBe("terracotta");
  });

  it("refleja el estado hidratado en el DOM al crear el store", () => {
    localStorage.setItem("sphereswitch:layout", "editorial");
    createStore(config);
    expect(document.documentElement.getAttribute("data-sphereswitch-layout")).toBe("editorial");
  });

  it("lanza ante una dimensión o un valor desconocidos", () => {
    const store = createStore(config);
    expect(() => store.set("spacing", "lg")).toThrow(/desconocida/);
    expect(() => store.set("font", "papyrus")).toThrow(/no válido/);
    expect(() => store.get("spacing")).toThrow(/desconocida/);
  });

  it("reset devuelve una dimensión a su defecto y borra la clave", () => {
    const store = createStore(config);
    store.set("font", "serif");
    store.reset("font");
    expect(store.get("font")).toBe("sans");
    expect(localStorage.getItem("sphereswitch:font")).toBeNull();
  });

  it("reset sin argumentos devuelve todas las dimensiones al defecto", () => {
    const store = createStore(config);
    store.set("font", "serif");
    store.set("palette", "terracotta");
    store.reset();
    expect(store.getState()).toEqual({ font: "sans", palette: "slate", layout: "bento" });
  });
});

describe("createStore — suscripción (contrato useSyncExternalStore)", () => {
  it("notifica a los suscriptores en cada cambio y respeta la baja", () => {
    const store = createStore(config);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.set("font", "mono");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.set("font", "serif");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("no notifica si el valor no cambia", () => {
    const store = createStore(config);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set("font", "sans"); // ya es el valor actual
    expect(listener).not.toHaveBeenCalled();
  });

  it("getSnapshot mantiene la referencia mientras el estado no cambie", () => {
    const store = createStore(config);
    const first = store.getSnapshot();
    expect(store.getSnapshot()).toBe(first);
    store.set("font", "mono");
    expect(store.getSnapshot()).not.toBe(first);
  });

  it("getServerSnapshot siempre devuelve el estado por defecto y la misma referencia", () => {
    const store = createStore(config);
    const server = store.getServerSnapshot();
    store.set("font", "mono");
    expect(store.getServerSnapshot()).toBe(server);
    expect(server).toEqual({ font: "sans", palette: "slate", layout: "bento" });
  });
});

describe("createStore — CustomEvent", () => {
  it("emite sphereswitch:change con el detalle completo", () => {
    const store = createStore(config);
    const handler = vi.fn<(event: Event) => void>();
    window.addEventListener("sphereswitch:change", handler);

    store.set("palette", "terracotta");

    expect(handler).toHaveBeenCalledTimes(1);
    const detail = (handler.mock.calls[0]![0] as CustomEvent<SphereSwitchChangeDetail>).detail;
    expect(detail).toMatchObject({
      dimension: "palette",
      previousValue: "slate",
      value: "terracotta",
      external: false,
    });
    expect(detail.state.palette).toBe("terracotta");

    window.removeEventListener("sphereswitch:change", handler);
  });
});

describe("createStore — sincronización entre pestañas", () => {
  it("actualiza el estado al recibir un evento storage de otra pestaña", () => {
    const store = createStore(config);
    const listener = vi.fn();
    store.subscribe(listener);

    localStorage.setItem("sphereswitch:font", "serif");
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "sphereswitch:font",
        newValue: "serif",
        storageArea: localStorage,
      }),
    );

    expect(store.get("font")).toBe("serif");
    expect(listener).toHaveBeenCalled();
  });

  it("marca external: true en el evento derivado de otra pestaña", () => {
    createStore(config);
    const handler = vi.fn<(event: Event) => void>();
    window.addEventListener("sphereswitch:change", handler);

    localStorage.setItem("sphereswitch:palette", "terracotta");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "sphereswitch:palette", storageArea: localStorage }),
    );

    const detail = (handler.mock.calls[0]![0] as CustomEvent<SphereSwitchChangeDetail>).detail;
    expect(detail.external).toBe(true);
    window.removeEventListener("sphereswitch:change", handler);
  });

  it("ignora eventos storage de claves ajenas", () => {
    const store = createStore(config);
    const listener = vi.fn();
    store.subscribe(listener);

    window.dispatchEvent(
      new StorageEvent("storage", { key: "otra-libreria:cosa", storageArea: localStorage }),
    );
    expect(listener).not.toHaveBeenCalled();
  });

  it("destroy desengancha el listener de storage", () => {
    const store = createStore(config);
    const listener = vi.fn();
    store.subscribe(listener);
    store.destroy();

    localStorage.setItem("sphereswitch:font", "serif");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "sphereswitch:font", storageArea: localStorage }),
    );
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("createStore — modo preview (comparación A/B)", () => {
  it("la combinación forzada gana sobre localStorage en la hidratación", () => {
    localStorage.setItem("sphereswitch:palette", "slate");
    const store = createStore(config, { preview: { palette: "terracotta" } });
    expect(store.get("palette")).toBe("terracotta");
    store.destroy();
  });

  it("una dimensión forzada no se persiste al cambiarla", () => {
    const store = createStore(config, { preview: { palette: "slate" } });
    store.set("palette", "terracotta");
    expect(store.get("palette")).toBe("terracotta");
    expect(localStorage.getItem("sphereswitch:palette")).toBeNull();
    store.destroy();
  });

  it("una dimensión forzada ignora los eventos storage de otras pestañas", () => {
    const store = createStore(config, { preview: { palette: "slate" } });
    localStorage.setItem("sphereswitch:palette", "terracotta");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "sphereswitch:palette", storageArea: localStorage }),
    );
    expect(store.get("palette")).toBe("slate");
    store.destroy();
  });

  it("preview: null ignora la URL por completo", () => {
    const store = createStore(config, { preview: null });
    expect(store.get("palette")).toBe("slate");
    store.destroy();
  });
});

describe("createStore — prefijos personalizados", () => {
  it("usa storageKeyPrefix y attributePrefix propios", () => {
    const store = createStore({
      dimensions: [{ name: "mode", values: ["a", "b"], defaultValue: "a" }],
      storageKeyPrefix: "demo",
      attributePrefix: "demo",
    });
    store.set("mode", "b");
    expect(localStorage.getItem("demo:mode")).toBe("b");
    expect(document.documentElement.getAttribute("data-demo-mode")).toBe("b");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
