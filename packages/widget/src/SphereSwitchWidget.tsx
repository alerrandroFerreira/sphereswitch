"use client";

import { useCallback, useEffect, useState } from "react";
import { isEmbeddedPreview } from "@sphereswitch/core";
import {
  useFigmaBridge,
  useHistory,
  useRemix,
  useSystemSync,
  useUsageStats,
} from "@sphereswitch/react";
import { ABCompare } from "./ABCompare";
import type { ABCombo } from "./ABCompare";
import { ColorLab } from "./color/ColorLab";
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

function toCombo(entry: { font: string; palette: string; layout: string } | undefined): ABCombo {
  return entry ? { font: entry.font, palette: entry.palette, layout: entry.layout } : {};
}

/** Componente raíz: compone el orbe, el command palette y el centro de comandos. */
export function SphereSwitchWidget({ position = "bottom-right" }: SphereSwitchWidgetProps) {
  const { open, setOpen } = useCommandPalette();
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [abOpen, setAbOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);

  const history = useHistory();
  const { undo, redo } = history;
  const { toggle: toggleSystemSync } = useSystemSync();
  const { toggle: toggleFigmaBridge } = useFigmaBridge();
  const { remix, rejectCurrent } = useRemix();
  useUsageStats(); // arranca el registro de estadísticas locales
  const embedded = isEmbeddedPreview();

  useEffect(() => {
    if (!embedded) injectWidgetStyles();
  }, [embedded]);

  const openPalette = useCallback(
    (filter?: string) => {
      setSearch(filter);
      setOpen(filter === undefined ? (current) => !current : true);
    },
    [setOpen],
  );

  const openCheatsheet = useCallback(() => setCheatsheetOpen(true), []);
  const openConsole = useCallback(() => setConsoleOpen(true), []);
  const compareAB = useCallback(() => setAbOpen(true), []);
  const openColorLab = useCallback(() => setLabOpen(true), []);

  useBuiltinCommands({
    openPalette,
    openCheatsheet,
    openConsole,
    compareAB,
    openColorLab,
    toggleSystemSync,
    toggleFigmaBridge,
    remix,
    rejectCurrent,
    undo,
    redo,
  });
  useCommandDispatcher();

  // Dentro de un iframe de comparación no se monta el widget: el iframe muestra
  // el sitio, no otra copia de SphereSwitch encima.
  if (embedded) return null;

  const comboA = toCombo(history.entries[history.cursor]);
  const comboB = toCombo(history.entries[history.cursor - 1]);

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
      {abOpen ? (
        <ABCompare
          open={abOpen}
          onOpenChange={setAbOpen}
          comboA={comboA}
          comboB={comboB}
          labelA="Actual"
          labelB="Anterior"
        />
      ) : null}
      {labOpen ? <ColorLab open={labOpen} onOpenChange={setLabOpen} /> : null}
    </div>
  );
}
