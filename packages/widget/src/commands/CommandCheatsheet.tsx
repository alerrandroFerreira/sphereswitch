"use client";

import { Command } from "cmdk";
import { useCommandList } from "./registry";
import { formatShortcut } from "./types";

export interface CommandCheatsheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/**
 * ⌘⇧/ — resuelve el problema de "no sé qué atajos existen": sin esto, tener
 * docenas de atajos directos sin pasar por ⌘K es invisible para quien no los
 * memorizó. Lista todos los comandos registrados con su atajo; seleccionar
 * uno lo ejecuta.
 */
export function CommandCheatsheet({ open, onOpenChange }: CommandCheatsheetProps) {
  const commands = useCommandList();

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Atajos de SphereSwitch"
      overlayClassName="sphereswitch-root sphereswitch-palette-overlay"
      contentClassName="sphereswitch-root sphereswitch-palette"
    >
      <Command.Input placeholder="Buscar un comando…" />
      <Command.List>
        <Command.Empty>Sin resultados.</Command.Empty>
        <Command.Group heading="Atajos">
          {commands.map((command) => (
            <Command.Item key={command.id} value={command.label} onSelect={command.execute}>
              <span>{command.label}</span>
              {command.shortcut ? <kbd>{formatShortcut(command.shortcut)}</kbd> : null}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
