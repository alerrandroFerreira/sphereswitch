import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { commandRegistry } from "./registry";
import { useCommandDispatcher } from "./useCommandDispatcher";
import { useGlobalShortcut } from "./useGlobalShortcut";

function ShortcutProbe({ onFire }: { onFire: () => void }) {
  useGlobalShortcut({ key: "f", mod: true, shift: true }, onFire);
  return null;
}

function DispatcherProbe() {
  useCommandDispatcher();
  return null;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useGlobalShortcut", () => {
  it("dispara el handler cuando el atajo coincide", () => {
    const onFire = vi.fn();
    render(<ShortcutProbe onFire={onFire} />);

    fireEvent.keyDown(window, { key: "f", metaKey: true, shiftKey: true });
    expect(onFire).toHaveBeenCalledOnce();
  });

  it("no dispara si falta un modificador", () => {
    const onFire = vi.fn();
    render(<ShortcutProbe onFire={onFire} />);

    fireEvent.keyDown(window, { key: "f", metaKey: true }); // sin shift
    expect(onFire).not.toHaveBeenCalled();
  });

  it("limpia el listener al desmontar: no dispara tras el unmount", () => {
    const onFire = vi.fn();
    const { unmount } = render(<ShortcutProbe onFire={onFire} />);
    unmount();

    fireEvent.keyDown(window, { key: "f", metaKey: true, shiftKey: true });
    expect(onFire).not.toHaveBeenCalled();
  });

  it("montar y desmontar varias veces no acumula listeners (sin fugas)", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<ShortcutProbe onFire={vi.fn()} />);
      unmount();
    }

    const added = addSpy.mock.calls.filter(([type]) => type === "keydown").length;
    const removed = removeSpy.mock.calls.filter(([type]) => type === "keydown").length;
    expect(added).toBe(5);
    expect(removed).toBe(5);
  });
});

describe("useCommandDispatcher — infraestructura del registro", () => {
  it("ejecuta el comando registrado cuyo atajo coincide con la tecla pulsada", () => {
    const execute = vi.fn();
    commandRegistry.register({
      id: "abrir-algo",
      label: "Abrir algo",
      category: "General",
      shortcut: { key: "p", mod: true, shift: true },
      execute,
    });

    render(<DispatcherProbe />);
    fireEvent.keyDown(window, { key: "p", metaKey: true, shiftKey: true });
    expect(execute).toHaveBeenCalledOnce();
  });

  it("un único listener sirve para cualquier número de comandos registrados", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<DispatcherProbe />);

    const a = vi.fn();
    const b = vi.fn();
    commandRegistry.register({
      id: "a",
      label: "A",
      category: "General",
      shortcut: { key: "a", mod: true, shift: true },
      execute: a,
    });
    commandRegistry.register({
      id: "b",
      label: "B",
      category: "General",
      shortcut: { key: "b", mod: true, shift: true },
      execute: b,
    });

    fireEvent.keyDown(window, { key: "a", metaKey: true, shiftKey: true });
    fireEvent.keyDown(window, { key: "b", metaKey: true, shiftKey: true });
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();

    const keydownListeners = addSpy.mock.calls.filter(([type]) => type === "keydown").length;
    expect(keydownListeners).toBe(1);
  });

  it("desmontar y volver a montar no deja el listener duplicado ni huérfano", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<DispatcherProbe />);
    unmount();

    const removed = removeSpy.mock.calls.filter(([type]) => type === "keydown").length;
    expect(removed).toBe(1);

    const execute = vi.fn();
    commandRegistry.register({
      id: "post-unmount",
      label: "Tras desmontar",
      category: "General",
      shortcut: { key: "q", mod: true, shift: true },
      execute,
    });
    fireEvent.keyDown(window, { key: "q", metaKey: true, shiftKey: true });
    expect(execute).not.toHaveBeenCalled(); // sin dispatcher montado, nada escucha
  });
});
