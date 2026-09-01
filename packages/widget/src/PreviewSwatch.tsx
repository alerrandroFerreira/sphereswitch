"use client";

export interface PreviewSwatchProps {
  readonly color: string;
}

/** Preview de color en vivo: un chip con el color real de la entrada del catálogo. */
export function PreviewSwatch({ color }: PreviewSwatchProps) {
  return (
    <span
      className="sphereswitch-swatch"
      style={{ background: color }}
      aria-hidden="true"
      data-testid="preview-swatch"
    />
  );
}
