"use client";

import { useEffect, useRef } from "react";
import type { Shortcut } from "./types";
import { eventShortcutKey, shortcutKey } from "./types";

/**
 * Hook propio de atajo global — sin librería externa (`react-hotkeys-hook` y
 * similares no encajan con las necesidades concretas de un command center tan
 * pequeño). Une un `Shortcut` a un handler mientras el componente está
 * montado y limpia el listener de `window` al desmontar.
 */
export function useGlobalShortcut(shortcut: Shortcut, handler: () => void, enabled = true): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const key = shortcutKey(shortcut);

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (eventShortcutKey(event) === key) {
        event.preventDefault();
        handlerRef.current();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, enabled]);
}
