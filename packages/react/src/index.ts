// Punto de entrada público de @sphereswitch/react.

export { SphereSwitchProvider } from "./SphereSwitchProvider";
export { useDimension } from "./useDimension";
export { usePalette, useFont, useLayout } from "./useDimensions";
export { useMounted } from "./useMounted";
export { useSphereSwitchStore } from "./useStore";
export { configureGlobalStore, getGlobalStore } from "./internal/store";

export type { DimensionTuple } from "./useDimension";
export type { SphereSwitchProviderProps } from "./types";
