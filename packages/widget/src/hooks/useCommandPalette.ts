"use client";

import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export interface UseCommandPaletteResult {
  readonly open: boolean;
  readonly setOpen: Dispatch<SetStateAction<boolean>>;
  readonly toggle: () => void;
}

/**
 * Estado abierto/cerrado del command palette. El propio ⌘K ya no se escucha
 * aquí: desde el Goal 11 es un comando más del registro central
 * (`useBuiltinCommands` + `useCommandDispatcher`), para que exista un único
 * listener global en vez de uno por hook.
 */
export function useCommandPalette(): UseCommandPaletteResult {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((current) => !current), []);
  return { open, setOpen, toggle };
}
