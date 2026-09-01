"use client";

import { useContext } from "react";
import type { SphereSwitchStore } from "@sphereswitch/core";
import { SphereSwitchContext } from "./context";
import { getGlobalStore } from "./internal/store";

/**
 * Devuelve el store del `<SphereSwitchProvider>` más cercano; si no hay
 * Provider, el store global. Acceso de bajo nivel — la mayoría de componentes
 * usan `useDimension` o los hooks de conveniencia.
 */
export function useSphereSwitchStore(): SphereSwitchStore {
  return useContext(SphereSwitchContext) ?? getGlobalStore();
}
