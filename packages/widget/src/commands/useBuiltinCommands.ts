"use client";

import { useEffect } from "react";
import { commandRegistry } from "./registry";

export interface BuiltinCommandsOptions {
  /** Abre el palette; con `filter` lo abre ya buscando esa sección. */
  readonly openPalette: (filter?: string) => void;
  readonly openCheatsheet: () => void;
  readonly openConsole: () => void;
  readonly compareAB: () => void;
  readonly openColorLab: () => void;
  readonly toggleSystemSync: () => void;
  readonly remix: () => void;
  readonly rejectCurrent: () => void;
  readonly undo: () => void;
  readonly redo: () => void;
}

/**
 * Registra los comandos que ya existían desde el Goal 10 en la infraestructura
 * de este goal. Convención de atajos: doble modificador (⌘⇧<letra>) para todo
 * comando nuevo — excepto ⌘K, que se mantiene como está por ser el estándar
 * reconocido del patrón de apertura del palette.
 */
export function useBuiltinCommands({
  openPalette,
  openCheatsheet,
  openConsole,
  compareAB,
  openColorLab,
  toggleSystemSync,
  remix,
  rejectCurrent,
  undo,
  redo,
}: BuiltinCommandsOptions): void {
  useEffect(() => {
    const unregisters = [
      commandRegistry.register({
        id: "open-command-palette",
        label: "Abrir el centro de comandos",
        category: "General",
        shortcut: { key: "k", mod: true },
        execute: () => openPalette(),
      }),
      commandRegistry.register({
        id: "switch-font",
        label: "Cambiar fuente",
        category: "General",
        shortcut: { key: "f", mod: true, shift: true },
        execute: () => openPalette("Fuentes"),
      }),
      commandRegistry.register({
        id: "switch-palette",
        label: "Cambiar paleta",
        category: "General",
        shortcut: { key: "p", mod: true, shift: true },
        execute: () => openPalette("Paletas"),
      }),
      commandRegistry.register({
        id: "switch-layout",
        label: "Cambiar layout",
        category: "General",
        shortcut: { key: "l", mod: true, shift: true },
        execute: () => openPalette("Layouts"),
      }),
      commandRegistry.register({
        id: "open-cheatsheet",
        label: "Ver todos los atajos",
        category: "General",
        shortcut: { key: "/", mod: true, shift: true },
        execute: openCheatsheet,
      }),
      commandRegistry.register({
        id: "open-console",
        label: "Ver la consola de código",
        category: "General",
        shortcut: { key: "c", mod: true, shift: true },
        execute: openConsole,
      }),
      commandRegistry.register({
        id: "compare-ab",
        label: "Comparar A/B",
        category: "Historial",
        shortcut: { key: "a", mod: true, shift: true },
        execute: compareAB,
      }),
      commandRegistry.register({
        id: "color-lab",
        label: "Análisis de color",
        category: "Color",
        shortcut: { key: "i", mod: true, shift: true },
        execute: openColorLab,
      }),
      commandRegistry.register({
        id: "toggle-system-sync",
        label: "Sincronizar con el modo del sistema",
        category: "Color",
        shortcut: { key: "s", mod: true, shift: true },
        execute: toggleSystemSync,
      }),
      commandRegistry.register({
        id: "remix",
        label: "Combinación aleatoria",
        category: "Combos",
        shortcut: { key: "r", mod: true, shift: true },
        execute: remix,
      }),
      commandRegistry.register({
        id: "reject-current",
        label: "Descartar esta combinación",
        category: "Combos",
        shortcut: { key: "x", mod: true, shift: true },
        execute: rejectCurrent,
      }),
      commandRegistry.register({
        id: "undo",
        label: "Deshacer",
        category: "Historial",
        // Excepción justificada: ⌘Z es universal, ningún usuario lo espera distinto.
        shortcut: { key: "z", mod: true },
        execute: undo,
      }),
      commandRegistry.register({
        id: "redo",
        label: "Rehacer",
        category: "Historial",
        shortcut: { key: "z", mod: true, shift: true },
        execute: redo,
      }),
    ];
    return () => unregisters.forEach((unregister) => unregister());
  }, [
    openPalette,
    openCheatsheet,
    openConsole,
    compareAB,
    openColorLab,
    toggleSystemSync,
    remix,
    rejectCurrent,
    undo,
    redo,
  ]);
}
