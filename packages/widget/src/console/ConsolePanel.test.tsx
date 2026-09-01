import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Monaco no funciona en jsdom: se sustituye por un <pre> que expone su `value`.
vi.mock("@monaco-editor/react", () => ({
  default: ({ value }: { value: string }) => <pre data-testid="monaco">{value}</pre>,
}));

import { defineConfig, generateCssBlock } from "@sphereswitch/core";
import {
  fontPairToEntry,
  getFontPairById,
  getPaletteById,
  paletteToEntry,
} from "@sphereswitch/core";
import { SphereSwitchProvider } from "@sphereswitch/react";
import { ConsolePanel } from "./ConsolePanel";

const config = defineConfig({
  palettes: {
    replace: [
      { id: "tinta-china", colors: { "--color-bg": "#f7f5f0" } },
      { id: "pizarra-fria", colors: { "--color-bg": "#0f172a" } },
    ],
  },
  fonts: { replace: [{ id: "canela", fonts: { "--font-body": "Inter" } }] },
  layouts: { replace: [{ id: "bento" }] },
  defaults: { palette: "tinta-china", font: "canela" },
});

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SphereSwitchProvider config={config} injectFoucScript={false}>
      {children}
    </SphereSwitchProvider>
  );
}

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText } });
});

afterEach(() => {
  writeText.mockClear();
  localStorage.clear();
});

function expectedCss(paletteId: string, fontId: string): string {
  return generateCssBlock({
    font: fontPairToEntry(getFontPairById(fontId)!),
    palette: paletteToEntry(getPaletteById(paletteId)!),
  });
}

describe("ConsolePanel", () => {
  it("muestra el bloque CSS de la combinación activa (mismo generador que la exportación)", async () => {
    render(<ConsolePanel open onOpenChange={vi.fn()} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByTestId("monaco").textContent).toBe(expectedCss("tinta-china", "canela"));
    });
  });

  it("el contenido cambia en vivo al cambiar de combo", async () => {
    localStorage.setItem("sphereswitch:palette", "pizarra-fria");
    render(<ConsolePanel open onOpenChange={vi.fn()} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByTestId("monaco").textContent).toBe(expectedCss("pizarra-fria", "canela"));
    });
  });

  it("el botón de copiar pone el contenido exacto en el portapapeles", async () => {
    render(<ConsolePanel open onOpenChange={vi.fn()} />, { wrapper });
    await waitFor(() => expect(screen.getByTestId("monaco")).toBeTruthy());

    fireEvent.click(screen.getByTestId("console-copy"));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(expectedCss("tinta-china", "canela"));
    });
  });
});

describe("carga perezosa de Monaco", () => {
  const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

  it("el editor nunca se importa de forma estática, solo vía lazy(() => import())", () => {
    const panel = read("./ConsolePanel.tsx");
    expect(panel).toMatch(/lazy\(\(\) => import\(["']\.\/CodeConsole["']\)\)/);

    // Ningún archivo del widget, salvo el propio CodeConsole, toca Monaco directamente.
    for (const rel of ["./ConsolePanel.tsx", "../SphereSwitchWidget.tsx", "../index.ts"]) {
      expect(read(rel), rel).not.toContain('from "@monaco-editor/react"');
    }
  });
});
