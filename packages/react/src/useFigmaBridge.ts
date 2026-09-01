"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectBridge,
  fontPairToEntry,
  generateTokenMap,
  getFontPairById,
  getPaletteById,
  paletteToEntry,
} from "@sphereswitch/core";
import type { BridgeConnection, BridgeStatus } from "@sphereswitch/core";
import { useFont, usePalette } from "./useDimensions";

const FLAG_KEY = "sphereswitch:figma-bridge";
export const DEFAULT_BRIDGE_URL = "ws://localhost:51037";

function readFlag(): boolean {
  try {
    return localStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export interface UseFigmaBridgeResult {
  readonly enabled: boolean;
  readonly status: BridgeStatus;
  toggle: () => void;
}

/**
 * Envía la combinación activa al puente local (`sphereswitch-bridge`), que la
 * reenvía al plugin de Figma. Cero acceso a red externa: solo `localhost`.
 */
export function useFigmaBridge(url: string = DEFAULT_BRIDGE_URL): UseFigmaBridgeResult {
  const [font] = useFont();
  const [palette] = usePalette();
  const [enabled, setEnabled] = useState<boolean>(readFlag);
  const [status, setStatus] = useState<BridgeStatus>("closed");
  const connectionRef = useRef<BridgeConnection | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus("closed");
      return;
    }
    const connection = connectBridge({ url, onStatus: setStatus });
    connectionRef.current = connection;
    return () => {
      connection.close();
      connectionRef.current = null;
    };
  }, [enabled, url]);

  useEffect(() => {
    if (!enabled || !connectionRef.current) return;
    const fontPair = getFontPairById(font);
    const activePalette = getPaletteById(palette);
    const tokens = generateTokenMap({
      ...(fontPair ? { font: fontPairToEntry(fontPair) } : {}),
      ...(activePalette ? { palette: paletteToEntry(activePalette) } : {}),
    });
    connectionRef.current.send({ type: "combo", tokens });
  }, [enabled, font, palette]);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      try {
        localStorage.setItem(FLAG_KEY, next ? "1" : "0");
      } catch {
        /* almacenamiento no disponible */
      }
      return next;
    });
  }, []);

  return { enabled, status, toggle };
}
