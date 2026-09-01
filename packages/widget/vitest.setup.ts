import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { commandRegistry } from "./src/commands/registry";

// jsdom no implementa ResizeObserver; cmdk lo usa para medir la lista.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
// @ts-expect-error -- polyfill mínimo solo para el entorno de test
globalThis.ResizeObserver ??= ResizeObserverStub;

// jsdom tampoco implementa scrollIntoView (cmdk lo usa al mover la selección).
Element.prototype.scrollIntoView ??= () => {};

afterEach(() => {
  cleanup();
  commandRegistry.__resetForTests();
  localStorage.clear();
  document
    .querySelectorAll("style[data-sphereswitch-styles], link[data-sphereswitch-font]")
    .forEach((el) => {
      el.remove();
    });
});
