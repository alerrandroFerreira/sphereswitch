"use client";

import { useEffect } from "react";
import { commandRegistry } from "./registry";
import { eventShortcutKey } from "./types";

/**
 * Un único listener global para TODOS los comandos registrados — no uno por
 * atajo. Se monta una vez en `SphereSwitchWidget`; el registro puede crecer o
 * encogerse (Goals 14–18 añaden comandos) sin que este listener cambie.
 */
export function useCommandDispatcher(): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      const command = commandRegistry.getByShortcutKey(eventShortcutKey(event));
      if (!command) return;
      event.preventDefault();
      command.execute();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
