"use client";

import { useMemo } from "react";
import { createComboNamer, getPaletteById } from "@sphereswitch/core";
import type { ComboNamer } from "@sphereswitch/core";
import { useFont, useLayout, usePalette } from "./useDimensions";

let namer: ComboNamer | null = null;
function getNamer(): ComboNamer {
  namer ??= createComboNamer();
  return namer;
}

/**
 * Nombre automático de la combinación activa —
 * `<paleta> <adjetivo> #<n>`, p. ej. "Terracota Serena Serena #42".
 * La misma combinación siempre devuelve el mismo nombre.
 */
export function useComboName(): string {
  const [font] = useFont();
  const [palette] = usePalette();
  const [layout] = useLayout();

  return useMemo(() => {
    const label = getPaletteById(palette)?.name ?? palette;
    return getNamer().nameFor({ font, palette, layout }, label);
  }, [font, palette, layout]);
}
