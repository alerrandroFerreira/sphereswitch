"use client";

import { Suspense, lazy, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { generateCssBlock, getFontPairById, getPaletteById } from "@sphereswitch/core";
import { fontPairToEntry, paletteToEntry } from "@sphereswitch/core";
import { useFont, usePalette } from "@sphereswitch/react";

// Import perezoso: ni un byte de Monaco en la red hasta que este panel se abre.
const CodeConsole = lazy(() => import("./CodeConsole"));

export interface ConsolePanelProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/**
 * Consola de código: vista en vivo, de solo lectura, del bloque de custom
 * properties CSS de la combinación activa (fuente + paleta). El texto lo
 * genera `generateCssBlock` de core — la misma fuente que alimentará la
 * exportación del Goal 17.
 */
export function ConsolePanel({ open, onOpenChange }: ConsolePanelProps) {
  const [fontId] = useFont();
  const [paletteId] = usePalette();
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => {
    const fontPair = getFontPairById(fontId);
    const palette = getPaletteById(paletteId);
    return generateCssBlock({
      ...(fontPair ? { font: fontPairToEntry(fontPair) } : {}),
      ...(palette ? { palette: paletteToEntry(palette) } : {}),
    });
  }, [fontId, paletteId]);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Portapapeles bloqueado (permiso denegado, contexto no seguro): no romper.
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sphereswitch-root sphereswitch-palette-overlay" />
        <Dialog.Content
          className="sphereswitch-root sphereswitch-console"
          aria-label="Consola de código de SphereSwitch"
        >
          <div className="sphereswitch-console-bar">
            <span>combinación activa · CSS</span>
            <button type="button" onClick={copy} data-testid="console-copy">
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <div className="sphereswitch-console-editor" data-testid="console-editor">
            <Suspense fallback={<span className="sphereswitch-font-sample">Cargando…</span>}>
              <CodeConsole value={css} />
            </Suspense>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
