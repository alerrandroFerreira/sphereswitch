"use client";

import { createContext } from "react";
import type { SphereSwitchStore } from "@sphereswitch/core";

/** Store del Provider más cercano. `null` cuando no hay Provider en el árbol. */
export const SphereSwitchContext = createContext<SphereSwitchStore | null>(null);
SphereSwitchContext.displayName = "SphereSwitchContext";
