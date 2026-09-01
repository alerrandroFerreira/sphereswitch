"use client";

import { Command } from "cmdk";
import type { FontPair, Palette } from "@sphereswitch/core";
import { PreviewFontSample } from "./PreviewFontSample";
import { PreviewSwatch } from "./PreviewSwatch";

export interface DimensionOption {
  readonly id: string;
  readonly label: string;
  readonly palette?: Palette;
  readonly fontPair?: FontPair;
}

export interface PaletteSectionProps {
  readonly heading: string;
  readonly options: readonly DimensionOption[];
  readonly activeId: string;
  readonly onSelect: (id: string) => void;
}

/** Una sección filtrada por tipo (Fuentes / Paletas / Layouts), nunca mezcladas. */
export function PaletteSection({ heading, options, activeId, onSelect }: PaletteSectionProps) {
  if (options.length === 0) return null;

  return (
    <Command.Group heading={heading}>
      {options.map((option) => (
        <Command.Item
          key={option.id}
          value={`${heading} ${option.label} ${option.id}`}
          onSelect={() => onSelect(option.id)}
        >
          {option.palette ? <PreviewSwatch color={option.palette.colors.accent} /> : null}
          <span>{option.label}</span>
          {option.fontPair ? <PreviewFontSample pair={option.fontPair} /> : null}
          {option.id === activeId ? <kbd>activo</kbd> : null}
        </Command.Item>
      ))}
    </Command.Group>
  );
}
