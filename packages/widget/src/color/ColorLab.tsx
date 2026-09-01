"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  COLOR_VISION_TYPES,
  colorVisionMatrix,
  contrastRatio,
  getPaletteById,
  meetsWcagAa,
  meetsWcagAaa,
} from "@sphereswitch/core";
import type { ColorVisionType } from "@sphereswitch/core";
import { usePalette } from "@sphereswitch/react";
import { srOnly } from "../a11y";
import { extractPalette } from "./imagePalette";

export interface ColorLabProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

const FILTER_ID = "sphereswitch-color-vision";
type Vision = "normal" | ColorVisionType;

/**
 * Análisis de color: extracción de paleta desde una imagen (k-means, sin
 * librería), simulación de daltonismo con `feColorMatrix` de SVG (lo resuelve
 * la GPU) y lectura de contraste de la paleta activa.
 */
export function ColorLab({ open, onOpenChange }: ColorLabProps) {
  const [paletteId] = usePalette();
  const [swatches, setSwatches] = useState<string[]>([]);
  const [vision, setVision] = useState<Vision>("normal");

  const active = getPaletteById(paletteId);
  const ratio = active ? contrastRatio(active.colors.background, active.colors.foreground) : null;

  const matrixValues = useMemo(
    () => (vision === "normal" ? null : colorVisionMatrix(vision).join(" ")),
    [vision],
  );

  function onFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setSwatches(extractPalette(image, 5));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sphereswitch-root sphereswitch-palette-overlay" />
        <Dialog.Content className="sphereswitch-root sphereswitch-lab">
          <Dialog.Title style={srOnly}>Análisis de color de SphereSwitch</Dialog.Title>
          <Dialog.Description style={srOnly}>
            Extracción de paleta desde imagen, simulación de daltonismo y lectura de contraste.
          </Dialog.Description>
          <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
            <filter id={FILTER_ID} colorInterpolationFilters="sRGB">
              {matrixValues ? <feColorMatrix type="matrix" values={matrixValues} /> : null}
            </filter>
          </svg>

          <label className="sphereswitch-lab-row">
            <span>Paleta desde imagen</span>
            <input type="file" accept="image/*" onChange={onFile} data-testid="lab-file" />
          </label>

          <div
            className="sphereswitch-lab-swatches"
            data-testid="lab-swatches"
            style={vision === "normal" ? undefined : { filter: `url(#${FILTER_ID})` }}
          >
            {swatches.map((hex) => (
              <span key={hex} title={hex} style={{ background: hex }} />
            ))}
          </div>

          <label className="sphereswitch-lab-row">
            <span>Simular daltonismo</span>
            <select
              value={vision}
              onChange={(event) => setVision(event.target.value as Vision)}
              data-testid="lab-vision"
            >
              <option value="normal">Sin simular</option>
              {COLOR_VISION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <div className="sphereswitch-lab-row" data-testid="lab-legibility">
            <span>Legibilidad de la paleta activa</span>
            {ratio !== null ? (
              <span>
                {ratio.toFixed(2)}:1{" "}
                {meetsWcagAaa(active!.colors.background, active!.colors.foreground)
                  ? "AAA"
                  : meetsWcagAa(active!.colors.background, active!.colors.foreground)
                    ? "AA"
                    : "por debajo de AA"}
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
