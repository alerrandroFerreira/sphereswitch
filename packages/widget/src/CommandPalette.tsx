"use client";

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { getFontPairById, getPaletteById } from "@sphereswitch/core";
import {
  useComboName,
  useFont,
  useLayout,
  usePalette,
  useSphereSwitchStore,
} from "@sphereswitch/react";
import { PaletteSection } from "./PaletteSection";
import type { DimensionOption } from "./PaletteSection";

export interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /**
   * Texto de búsqueda con el que abrir (p. ej. "Fuentes"), para que los
   * comandos "Cambiar fuente/paleta/layout" del Goal 11 abran ya filtrados a
   * su sección. `undefined` abre con la búsqueda vacía.
   */
  readonly initialSearch?: string;
}

/**
 * El modal de ⌘K. Se renderiza vía `Command.Dialog` de cmdk, que ya porta a
 * `document.body` y aplica el focus trap de Radix Dialog internamente — no
 * hace falta un `createPortal` propio encima.
 *
 * Secciones separadas por tipo (Fuentes / Paletas / Layouts), nunca
 * mezcladas — cada una lee sus valores admitidos de la configuración activa
 * del store y los cruza con el catálogo curado para el nombre y el preview.
 */
export function CommandPalette({ open, onOpenChange, initialSearch }: CommandPaletteProps) {
  const store = useSphereSwitchStore();
  const [font, setFont] = useFont();
  const [palette, setPalette] = usePalette();
  const [layout, setLayout] = useLayout();
  const comboName = useComboName();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) setSearch(initialSearch ?? "");
  }, [open, initialSearch]);

  const dimensions = store.getConfig().dimensions;

  const fontOptions = useMemo<DimensionOption[]>(() => {
    const values = dimensions.find((d) => d.name === "font")?.values ?? [];
    return values.map((id) => {
      const pair = getFontPairById(id);
      return pair === undefined ? { id, label: id } : { id, label: pair.name, fontPair: pair };
    });
  }, [dimensions]);

  const paletteOptions = useMemo<DimensionOption[]>(() => {
    const values = dimensions.find((d) => d.name === "palette")?.values ?? [];
    return values.map((id) => {
      const entry = getPaletteById(id);
      return entry === undefined ? { id, label: id } : { id, label: entry.name, palette: entry };
    });
  }, [dimensions]);

  const layoutOptions = useMemo<DimensionOption[]>(() => {
    const values = dimensions.find((d) => d.name === "layout")?.values ?? [];
    return values.map((id) => ({ id, label: id }));
  }, [dimensions]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Centro de comandos de SphereSwitch"
      overlayClassName="sphereswitch-root sphereswitch-palette-overlay"
      contentClassName="sphereswitch-root sphereswitch-palette"
    >
      <div className="sphereswitch-palette-combo" data-testid="combo-name">
        {comboName}
      </div>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar fuente, paleta o layout…"
      />
      <Command.List>
        <Command.Empty>Sin resultados.</Command.Empty>
        <PaletteSection
          heading="Fuentes"
          options={fontOptions}
          activeId={font}
          onSelect={setFont}
        />
        <PaletteSection
          heading="Paletas"
          options={paletteOptions}
          activeId={palette}
          onSelect={setPalette}
        />
        <PaletteSection
          heading="Layouts"
          options={layoutOptions}
          activeId={layout}
          onSelect={setLayout}
        />
      </Command.List>
    </Command.Dialog>
  );
}
