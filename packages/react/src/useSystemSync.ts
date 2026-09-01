"use client";

import { useCallback, useEffect, useState } from "react";
import { pickPaletteForMode } from "@sphereswitch/core";
import { usePalette } from "./useDimensions";
import { useSphereSwitchStore } from "./useStore";

const FLAG_KEY = "sphereswitch:system-sync";

function readFlag(): boolean {
  try {
    return localStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export interface UseSystemSyncResult {
  readonly enabled: boolean;
  toggle: () => void;
}

/**
 * Sincroniza la paleta activa con el modo claro/oscuro del sistema operativo
 * mientras está activada. El estado activado/desactivado se persiste.
 */
export function useSystemSync(): UseSystemSyncResult {
  const store = useSphereSwitchStore();
  const [, setPalette] = usePalette();
  const [enabled, setEnabled] = useState<boolean>(readFlag);

  const applyForMode = useCallback(
    (mode: "light" | "dark") => {
      const current = store.getState()["palette"] ?? "";
      const next = pickPaletteForMode(current, mode);
      if (next && next !== current) setPalette(next);
    },
    [store, setPalette],
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    applyForMode(media.matches ? "dark" : "light");
    const onChange = (event: MediaQueryListEvent): void => {
      applyForMode(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [enabled, applyForMode]);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      try {
        localStorage.setItem(FLAG_KEY, next ? "1" : "0");
      } catch {
        /* almacenamiento no disponible */
      }
      if (next) applyForMode(systemPrefersDark() ? "dark" : "light");
      return next;
    });
  }, [applyForMode]);

  return { enabled, toggle };
}
