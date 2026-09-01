"use client";

import { DIMENSION_FONT, DIMENSION_LAYOUT, DIMENSION_PALETTE } from "@sphereswitch/core";
import type { RegisteredFontId, RegisteredLayoutId, RegisteredPaletteId } from "@sphereswitch/core";
import { useDimension } from "./useDimension";
import type { DimensionTuple } from "./useDimension";

// El genérico devuelve `DimensionTuple<string>`; el tipo concreto de ids sale
// del aumento de módulo del `sphereswitch.config.ts` del proyecto (Goal 5).
// Si no hay aumento (o el config está en JS), `Registered*Id` degrada a `string`.
function useTypedDimension<TValue extends string>(name: string): DimensionTuple<TValue> {
  return useDimension(name) as unknown as DimensionTuple<TValue>;
}

/** `[paleta, setPaleta]`. Autocompleta los ids de paleta registrados. */
export function usePalette(): DimensionTuple<RegisteredPaletteId> {
  return useTypedDimension<RegisteredPaletteId>(DIMENSION_PALETTE);
}

/** `[fuente, setFuente]`. Autocompleta los ids de fuente registrados. */
export function useFont(): DimensionTuple<RegisteredFontId> {
  return useTypedDimension<RegisteredFontId>(DIMENSION_FONT);
}

/** `[layout, setLayout]`. Autocompleta los ids de layout registrados. */
export function useLayout(): DimensionTuple<RegisteredLayoutId> {
  return useTypedDimension<RegisteredLayoutId>(DIMENSION_LAYOUT);
}
