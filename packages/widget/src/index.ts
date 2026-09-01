// Punto de entrada público de @sphereswitch/widget.

export { SphereSwitchWidget } from "./SphereSwitchWidget";
export { Orb } from "./Orb";
export { CommandPalette } from "./CommandPalette";
export { PaletteSection } from "./PaletteSection";
export { PreviewSwatch } from "./PreviewSwatch";
export { PreviewFontSample } from "./PreviewFontSample";
export { useCommandPalette } from "./hooks/useCommandPalette";
export { injectWidgetStyles } from "./styles/inject";

export { commandRegistry, useCommandList } from "./commands/registry";
export { useGlobalShortcut } from "./commands/useGlobalShortcut";
export { useCommandDispatcher } from "./commands/useCommandDispatcher";
export { useBuiltinCommands } from "./commands/useBuiltinCommands";
export { CommandCheatsheet } from "./commands/CommandCheatsheet";
export { shortcutKey, eventShortcutKey, formatShortcut } from "./commands/types";
export { ConsolePanel } from "./console/ConsolePanel";
export { ABCompare, previewUrl } from "./ABCompare";
export { ColorLab } from "./color/ColorLab";
export { extractPalette, kmeansPalette } from "./color/imagePalette";

export type { SphereSwitchWidgetProps } from "./SphereSwitchWidget";
export type { OrbProps, OrbPosition } from "./Orb";
export type { CommandPaletteProps } from "./CommandPalette";
export type { DimensionOption, PaletteSectionProps } from "./PaletteSection";
export type { UseCommandPaletteResult } from "./hooks/useCommandPalette";
export type { Command, Shortcut } from "./commands/types";
export type { BuiltinCommandsOptions } from "./commands/useBuiltinCommands";
export type { CommandCheatsheetProps } from "./commands/CommandCheatsheet";
export type { ConsolePanelProps } from "./console/ConsolePanel";
export type { ABCombo, ABCompareProps } from "./ABCompare";
export type { ColorLabProps } from "./color/ColorLab";
