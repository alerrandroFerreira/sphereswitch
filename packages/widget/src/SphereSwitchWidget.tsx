"use client";

import { useCallback, useEffect, useState } from "react";
import { useHistory } from "@sphereswitch/react";
import { CommandPalette } from "./CommandPalette";
import { CommandCheatsheet } from "./commands/CommandCheatsheet";
import { useBuiltinCommands } from "./commands/useBuiltinCommands";
import { useCommandDispatcher } from "./commands/useCommandDispatcher";
import { ConsolePanel } from "./console/ConsolePanel";
import { Orb } from "./Orb";
import type { OrbPosition } from "./Orb";
import { useCommandPalette } from "./hooks/useCommandPalette";
import { injectWidgetStyles } from "./styles/inject";

export interface SphereSwitchWidgetProps {
  /**
   * Única prop de apariencia permitida: dónde flota el orbe. Por defecto
   * `"bottom-right"`. Nada más de estilo es personalizable — es la firma
   * visual de SphereSwitch, igual que la barra de herramientas de un devtool.
   */
  readonly position?: OrbPosition;
}

/** Componente raíz: compone el orbe, el command palette y el centro de comandos. */
export function SphereSwitchWidget({ position = "bottom-right" }: SphereSwitchWidgetProps) {
  const { open, setOpen } = useCommandPalette();
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    injectWidgetStyles();
  }, []);

  // Sin filtro: alterna abierto/cerrado (⌘K, click en el orbe). Con filtro
  // (los comandos "Cambiar fuente/paleta/layout"): siempre abre y filtra,
  // nunca cierra por repetición.
  const openPalette = useCallback(
    (filter?: string) => {
      setSearch(filter);
      setOpen(filter === undefined ? (current) => !current : true);
    },
    [setOpen],
  );

  const openCheatsheet = useCallback(() => setCheatsheetOpen(true), []);
  const openConsole = useCallback(() => setConsoleOpen(true), []);

  // `undo`/`redo` son métodos estables de la instancia de historial.
  const { undo, redo } = useHistory();

  useBuiltinCommands({ openPalette, openCheatsheet, openConsole, undo, redo });
  useCommandDispatcher();

  return (
    <div className="sphereswitch-root" data-sphereswitch-widget-root="">
      <Orb position={position} onActivate={() => openPalette()} />
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        {...(search !== undefined ? { initialSearch: search } : {})}
      />
      <CommandCheatsheet open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
      {consoleOpen ? <ConsolePanel open={consoleOpen} onOpenChange={setConsoleOpen} /> : null}
    </div>
  );
}
