// Único punto de entrada público de @sphereswitch/core.

export { createStore } from "./store";
export type { CreateStoreOptions } from "./store";
export {
  PREVIEW_PARAM,
  EMBED_PARAM,
  parsePreviewValue,
  serializePreviewValue,
  readPreviewFromLocation,
  isEmbeddedPreview,
} from "./preview";
export { getServerState } from "./ssr";
export { generateFoucScript } from "./fouc";
export { createStorage } from "./storage";
export { createHistory } from "./history";
export { createComboNamer, COMBO_ADJECTIVES, comboKey } from "./comboNames";
export { createRejectedCombos } from "./rejectedCombos";
export { createUsageStats } from "./stats";

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
  pickPaletteForMode,
} from "./data/palettes";
export {
  hexToRgb,
  rgbToHex,
  relativeLuminance,
  contrastRatio,
  meetsWcagAa,
  meetsWcagAaa,
  WCAG_AA_NORMAL,
  WCAG_AAA_NORMAL,
} from "./contrast";
export { colorVisionMatrix, COLOR_VISION_TYPES } from "./colorVision";
export type { ColorVisionType } from "./colorVision";
export { generateCssBlock, generateTokenMap, generateExport } from "./data/codegen";

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

export type { Combo, HistoryEntry, HistoryOptions, SphereSwitchHistory } from "./history";
export type { ComboNamer } from "./comboNames";
export type { RejectedCombos } from "./rejectedCombos";
export type { UsageStats, ComboUsage } from "./stats";
export type { CssBlockInput, ExportFormat } from "./data/codegen";

export type { FontFace, FontPair, FontSource } from "./data/fonts";

export type { Palette, PaletteColors } from "./data/palettes";
export type { Rgb } from "./contrast";

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
