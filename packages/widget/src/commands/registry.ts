"use client";

// El registro central de comandos. Este goal construye el registro y la
// infraestructura de atajos; la mayoría de los comandos que aparecerán aquí
// (deshacer, A/B, exportar…) se registran en goals posteriores, no en este.

import { useSyncExternalStore } from "react";
import type { Command } from "./types";
import { shortcutKey } from "./types";

class CommandRegistry {
  private readonly commands = new Map<string, Command>();
  private readonly shortcuts = new Map<string, string>();
  private readonly listeners = new Set<() => void>();
  private snapshot: readonly Command[] = [];

  /** Registra un comando. Lanza si el id o el atajo ya están en uso. */
  register(command: Command): () => void {
    if (this.commands.has(command.id)) {
      throw new Error(`[sphereswitch] Comando duplicado: "${command.id}".`);
    }
    if (command.shortcut) {
      const key = shortcutKey(command.shortcut);
      const existingId = this.shortcuts.get(key);
      if (existingId !== undefined) {
        throw new Error(
          `[sphereswitch] Colisión de atajo: "${command.id}" y "${existingId}" usan la misma combinación de teclas.`,
        );
      }
      this.shortcuts.set(key, command.id);
    }
    this.commands.set(command.id, command);
    this.emit();
    return () => this.unregister(command.id);
  }

  unregister(id: string): void {
    const command = this.commands.get(id);
    if (!command) return;
    this.commands.delete(id);
    if (command.shortcut) this.shortcuts.delete(shortcutKey(command.shortcut));
    this.emit();
  }

  getByShortcutKey(key: string): Command | undefined {
    const id = this.shortcuts.get(key);
    return id !== undefined ? this.commands.get(id) : undefined;
  }

  getById(id: string): Command | undefined {
    return this.commands.get(id);
  }

  list(): readonly Command[] {
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Solo para tests: vacía el registro entero. */
  __resetForTests(): void {
    this.commands.clear();
    this.shortcuts.clear();
    this.emit();
  }

  private emit(): void {
    this.snapshot = [...this.commands.values()];
    for (const listener of [...this.listeners]) listener();
  }
}

/** Único registro compartido por todo el widget. */
export const commandRegistry = new CommandRegistry();

/** Lista reactiva de comandos registrados (para la chuleta y similares). */
export function useCommandList(): readonly Command[] {
  return useSyncExternalStore(
    (listener) => commandRegistry.subscribe(listener),
    () => commandRegistry.list(),
    () => [] as readonly Command[],
  );
}
