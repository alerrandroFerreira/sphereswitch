// Punto de entrada público de @sphereswitch/react.

export { SphereSwitchProvider } from "./SphereSwitchProvider";
export { useDimension } from "./useDimension";
export { usePalette, useFont, useLayout } from "./useDimensions";
export { useMounted } from "./useMounted";
export { useSphereSwitchStore } from "./useStore";
export { configureGlobalStore, getGlobalStore } from "./internal/store";
export { LayoutSwitch, defineLayoutVariants } from "./LayoutSwitch";
export { useHistory } from "./useHistory";
export { useComboName } from "./useComboName";

export type { DimensionTuple } from "./useDimension";
export type { SphereSwitchProviderProps } from "./types";
export type { LayoutVariant, LayoutSwitchProps } from "./LayoutSwitch";
export type { UseHistoryResult } from "./useHistory";
