"use client";

import { Suspense, lazy, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  fontPairToEntry,
  generateExport,
  getFontPairById,
  getPaletteById,
  paletteToEntry,
} from "@sphereswitch/core";
import type { ExportFormat } from "@sphereswitch/core";
import { useFont, usePalette } from "@sphereswitch/react";
import { srOnly } from "../a11y";

// Import perezoso: ni un byte de Monaco en la red hasta que este panel se abre.
const CodeConsole = lazy(() => import("./CodeConsole"));

export interface ConsolePanelProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

const FORMATS: { readonly value: ExportFormat; readonly label: string; readonly lang: string }[] = [
  { value: "css", label: "CSS", lang: "css" },
  { value: "tailwind", label: "Tailwind", lang: "javascript" },
  { value: "json", label: "JSON", lang: "json" },
];

/**
 * Consola de código: vista en vivo, de solo lectura, de la combinación activa
 * (fuente + paleta). El texto lo genera `generateExport` de core — la misma
 * función para CSS, Tailwind y JSON, no tres generadores distintos.
 */
export function ConsolePanel({ open, onOpenChange }: ConsolePanelProps) {
  const [fontId] = useFont();
  const [paletteId] = usePalette();
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    const fontPair = getFontPairById(fontId);
    const palette = getPaletteById(paletteId);
    return generateExport(
      {
        ...(fontPair ? { font: fontPairToEntry(fontPair) } : {}),
        ...(palette ? { palette: paletteToEntry(palette) } : {}),
      },
      format,
    );
  }, [fontId, paletteId, format]);

  const language = FORMATS.find((entry) => entry.value === format)?.lang ?? "css";

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
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
        <Dialog.Content className="sphereswitch-root sphereswitch-console">
          <Dialog.Title style={srOnly}>Consola de código de SphereSwitch</Dialog.Title>
          <Dialog.Description style={srOnly}>
            La combinación de tema activa como código, de solo lectura.
          </Dialog.Description>
          <div className="sphereswitch-console-bar">
            <span role="tablist" aria-label="Formato de exportación">
              {FORMATS.map((entry) => (
                <button
                  key={entry.value}
                  type="button"
                  role="tab"
                  aria-selected={format === entry.value}
                  data-active={format === entry.value || undefined}
                  onClick={() => setFormat(entry.value)}
                >
                  {entry.label}
                </button>
              ))}
            </span>
            <button type="button" onClick={copy} data-testid="console-copy">
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <div className="sphereswitch-console-editor" data-testid="console-editor">
            <Suspense fallback={<span className="sphereswitch-font-sample">Cargando…</span>}>
              <CodeConsole value={code} language={language} />
            </Suspense>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
