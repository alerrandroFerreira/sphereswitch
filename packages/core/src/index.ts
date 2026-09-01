// Único punto de entrada público de @sphereswitch/core.

export { createStore } from "./store";
export { getServerState } from "./ssr";
export { generateFoucScript } from "./fouc";
export { createStorage } from "./storage";

export {
  defineConfig,
  resolveCatalog,
  resolveStoreConfig,
  isPaletteEntry,
  isFontPairEntry,
  isLayoutEntry,
} from "./config";

export { FONT_PAIRS, CURATED_FONTS, getFontPairById, fontPairToEntry } from "./data/fonts";
export { googleFontsHref, fontshareHref, getFontPairHrefs, applyFontPair } from "./data/fontLoader";

export {
  PALETTES,
  CURATED_PALETTES,
  getPaletteById,
  paletteToEntry,
  paletteContrast,
} from "./data/palettes";
export {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  meetsWcagAa,
  WCAG_AA_NORMAL,
} from "./data/color";

export {
  DEFAULT_STORAGE_KEY_PREFIX,
  DEFAULT_ATTRIBUTE_PREFIX,
  DEFAULT_EVENT_NAME,
  DIMENSION_FONT,
  DIMENSION_PALETTE,
  DIMENSION_LAYOUT,
  DEFAULT_DIMENSION_NAMES,
} from "./types";

export type {
  DimensionConfig,
  ResolvedConfig,
  SphereSwitchChangeDetail,
  SphereSwitchConfig,
  SphereSwitchState,
  SphereSwitchStore,
} from "./types";

export type { SphereSwitchStorage, StorageLike } from "./storage";

export type { FontFace, FontPair, FontSource } from "./data/fonts";

export type { Palette, PaletteColors } from "./data/palettes";
export type { Rgb } from "./data/color";

export type {
  ColorVariable,
  FontVariable,
  PaletteEntry,
  FontPairEntry,
  LayoutEntry,
  DimensionInput,
  CuratedCatalog,
  ResolvedCatalog,
  SphereSwitchUserConfig,
  SphereSwitchRegisteredConfig,
  RegisteredPaletteId,
  RegisteredFontId,
  RegisteredLayoutId,
} from "./config";
