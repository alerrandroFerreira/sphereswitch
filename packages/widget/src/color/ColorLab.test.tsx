import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { contrastRatio, defineConfig, getPaletteById } from "@sphereswitch/core";
import { SphereSwitchProvider } from "@sphereswitch/react";
import { ColorLab } from "./ColorLab";

const config = defineConfig({
  palettes: { replace: [{ id: "tinta-china", colors: { "--color-bg": "#f7f5f0" } }] },
  fonts: { replace: [{ id: "canela", fonts: { "--font-body": "Inter" } }] },
  layouts: { replace: [{ id: "bento" }] },
  defaults: { palette: "tinta-china" },
});

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SphereSwitchProvider config={config} injectFoucScript={false}>
      {children}
    </SphereSwitchProvider>
  );
}

afterEach(() => localStorage.clear());

describe("ColorLab", () => {
  it("muestra el contraste real de la paleta activa y su nivel WCAG", async () => {
    render(<ColorLab open onOpenChange={() => {}} />, { wrapper });
    const palette = getPaletteById("tinta-china")!;
    const expected = contrastRatio(palette.colors.background, palette.colors.foreground);

    await waitFor(() => {
      const readout = screen.getByTestId("lab-legibility").textContent ?? "";
      expect(readout).toContain(`${expected.toFixed(2)}:1`);
      expect(readout).toMatch(/AAA|AA/);
    });
  });

  it("aplica el filtro de daltonismo a las muestras al elegir un tipo", async () => {
    render(<ColorLab open onOpenChange={() => {}} />, { wrapper });
    const swatches = screen.getByTestId("lab-swatches");
    expect(swatches.getAttribute("style") ?? "").not.toContain("filter");

    fireEvent.change(screen.getByTestId("lab-vision"), { target: { value: "deuteranopia" } });
    await waitFor(() => {
      expect(screen.getByTestId("lab-swatches").getAttribute("style") ?? "").toContain(
        "url(#sphereswitch-color-vision)",
      );
    });

    // el <feColorMatrix> pasa a existir con 20 valores
    const feColorMatrix = document.querySelector("feColorMatrix");
    expect(feColorMatrix?.getAttribute("values")?.split(/\s+/)).toHaveLength(20);
  });
});
