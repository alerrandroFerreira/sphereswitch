"use client";

import { usePalette } from "@sphereswitch/react";
import { getPaletteById } from "@sphereswitch/core";

export type OrbPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export interface OrbProps {
  readonly position: OrbPosition;
  readonly onActivate: () => void;
}

const FALLBACK_ACCENT = "#8b93a3";

/**
 * La pastilla flotante: es el trigger y el indicador visual a la vez.
 *
 * El color no se lee de una variable CSS del host (`--color-accent`) — sería
 * frágil, depende de que el proyecto consumidor haya nombrado bien sus
 * variables. En vez de eso lee el dato real de la paleta activa desde el
 * catálogo y lo aplica como estilo inline: el orbe refleja la verdad aunque
 * el CSS del proyecto todavía no esté conectado. Si el orbe cambia de color
 * pero la página no, el problema está en el CSS del host, no en SphereSwitch.
 */
export function Orb({ position, onActivate }: OrbProps) {
  const [paletteId] = usePalette();
  const palette = getPaletteById(paletteId);
  const accent = palette?.colors.accent ?? FALLBACK_ACCENT;

  return (
    <button
      type="button"
      className="sphereswitch-orb"
      data-position={position}
      data-testid="sphereswitch-orb"
      onClick={onActivate}
      aria-label="Abrir el centro de comandos de SphereSwitch"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${accent}, transparent 70%), var(--ss-bg-elevated)`,
      }}
    />
  );
}
