import { describe, expect, it, vi } from "vitest";

import { commandRegistry } from "./registry";
import type { Command } from "./types";

function makeCommand(overrides: Partial<Command> = {}): Command {
  return {
    id: "test-command",
    label: "Comando de prueba",
    category: "General",
    execute: vi.fn(),
    ...overrides,
  };
}

describe("commandRegistry", () => {
  it("registra un comando y lo expone en list()", () => {
    commandRegistry.register(makeCommand());
    expect(commandRegistry.list().map((c) => c.id)).toContain("test-command");
  });

  it("dispara execute() al ejecutarlo", () => {
    const execute = vi.fn();
    commandRegistry.register(makeCommand({ execute }));
    commandRegistry.getById("test-command")!.execute();
    expect(execute).toHaveBeenCalledOnce();
  });

  it("rechaza un id duplicado", () => {
    commandRegistry.register(makeCommand());
    expect(() => commandRegistry.register(makeCommand())).toThrow(/duplicado/);
  });

  it("rechaza dos comandos con la misma combinación de teclas", () => {
    commandRegistry.register(
      makeCommand({ id: "a", shortcut: { key: "f", mod: true, shift: true } }),
    );
    expect(() =>
      commandRegistry.register(
        makeCommand({ id: "b", shortcut: { key: "f", mod: true, shift: true } }),
      ),
    ).toThrow(/[Cc]olisión/);
  });

  it("permite el mismo id de tecla con modificadores distintos", () => {
    commandRegistry.register(makeCommand({ id: "a", shortcut: { key: "f", mod: true } }));
    expect(() =>
      commandRegistry.register(
        makeCommand({ id: "b", shortcut: { key: "f", mod: true, shift: true } }),
      ),
    ).not.toThrow();
  });

  it("getByShortcutKey encuentra el comando por su clave canónica", () => {
    commandRegistry.register(
      makeCommand({ id: "cheatsheet", shortcut: { key: "/", mod: true, shift: true } }),
    );
    expect(commandRegistry.getByShortcutKey("mod+shift+/")?.id).toBe("cheatsheet");
  });

  it("unregister libera el id y el atajo para poder reusarlos", () => {
    const unregister = commandRegistry.register(makeCommand({ shortcut: { key: "k", mod: true } }));
    unregister();
    expect(commandRegistry.getById("test-command")).toBeUndefined();
    expect(() =>
      commandRegistry.register(makeCommand({ shortcut: { key: "k", mod: true } })),
    ).not.toThrow();
  });

  it("register() devuelve una función de baja idempotente-segura", () => {
    const unregister = commandRegistry.register(makeCommand());
    unregister();
    expect(() => unregister()).not.toThrow();
  });

  it("notifica a los suscriptores en cada cambio", () => {
    const listener = vi.fn();
    const unsubscribe = commandRegistry.subscribe(listener);
    const unregister = commandRegistry.register(makeCommand());
    expect(listener).toHaveBeenCalledTimes(1);
    unregister();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});
