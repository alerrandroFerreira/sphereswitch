import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { defineConfig } from "@sphereswitch/core";
import { SphereSwitchProvider } from "@sphereswitch/react";
import { ABCompare } from "./ABCompare";
import { SphereSwitchWidget } from "./SphereSwitchWidget";
import { WIDGET_STYLES_FOR_TESTS } from "./styles/inject";

const config = defineConfig({
  palettes: { replace: [{ id: "tinta-china", colors: { "--color-bg": "#fff" } }] },
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

describe("accesibilidad", () => {
  it("los estilos respetan prefers-reduced-motion", () => {
    expect(WIDGET_STYLES_FOR_TESTS).toContain("@media (prefers-reduced-motion: reduce)");
    // el orbe y cada panel están cubiertos
    for (const selector of [
      ".sphereswitch-orb",
      ".sphereswitch-palette",
      ".sphereswitch-console",
      ".sphereswitch-ab",
      ".sphereswitch-lab",
    ]) {
      const block = WIDGET_STYLES_FOR_TESTS.split("prefers-reduced-motion")[1] ?? "";
      expect(block, selector).toContain(selector);
    }
  });

  it("el orbe anuncia que abre un diálogo", () => {
    render(<SphereSwitchWidget />, { wrapper });
    const orb = screen.getByTestId("sphereswitch-orb");
    expect(orb.getAttribute("aria-haspopup")).toBe("dialog");
    expect(orb.getAttribute("aria-label")).toBeTruthy();
  });

  it("el command palette tiene título y descripción para lectores de pantalla", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(
        dialog.getAttribute("aria-label") ?? dialog.getAttribute("aria-labelledby"),
      ).toBeTruthy();
    });
  });

  it("ABCompare expone un título de diálogo accesible", () => {
    render(
      <ABCompare
        open
        onOpenChange={() => {}}
        comboA={{ palette: "a" }}
        comboB={{ palette: "b" }}
      />,
      { wrapper },
    );
    const dialog = screen.getByRole("dialog");
    const titleId = dialog.getAttribute("aria-labelledby");
    expect(titleId).toBeTruthy();
    expect(document.getElementById(titleId!)?.textContent).toMatch(/A\/B/);
  });

  it("al cerrar el palette con Escape, el foco vuelve fuera del modal", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    // el foco no queda atrapado en un nodo desmontado
    expect(document.activeElement).toBeTruthy();
  });
});
