"use client";

import type { FontPair } from "@sphereswitch/core";

export interface PreviewFontSampleProps {
  readonly pair: FontPair;
}

/**
 * Preview de fuente en vivo.
 *
 * Solo la pareja tipográfica ACTIVA tiene sus archivos cargados (Goal 7: la
 * carga es perezosa a propósito, nunca las 24 de golpe). Este preview no
 * fuerza la carga de la pareja bajo el cursor solo para previsualizarla —
 * eso reintroduciría el problema de rendimiento original. En vez de eso,
 * muestra el nombre de las dos caras con la tipografía del propio widget;
 * cuando la pareja pasa a ser la activa, `applyFontPair` (Goal 7) carga sus
 * archivos y `--font-display`/`--font-body` reflejan la tipografía real.
 */
export function PreviewFontSample({ pair }: PreviewFontSampleProps) {
  return (
    <span className="sphereswitch-font-sample" data-testid="preview-font-sample">
      {pair.displayFont.family} / {pair.bodyFont.family}
    </span>
  );
}
