import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { defineConfig, getPaletteById } from "@sphereswitch/core";
import { SphereSwitchProvider } from "@sphereswitch/react";
import { SphereSwitchWidget } from "./SphereSwitchWidget";

// Ids reales del catálogo curado (Goal 8) — el orbe lee `colors.accent` de ahí,
// nunca de una variable CSS del host.
const config = defineConfig({
  palettes: {
    replace: [
      { id: "pizarra-fria", colors: { "--color-bg": "#0f172a" } },
      { id: "tinta-china", colors: { "--color-bg": "#f7f5f0" } },
    ],
  },
  fonts: { replace: [{ id: "canela", fonts: { "--font-body": "Inter" } }] },
  layouts: { replace: [{ id: "bento" }] },
  defaults: { palette: "pizarra-fria" },
});

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SphereSwitchProvider config={config} injectFoucScript={false}>
      {children}
    </SphereSwitchProvider>
  );
}

afterEach(() => {
  localStorage.clear();
});

describe("SphereSwitchWidget — orbe y apertura", () => {
  it("renderiza el orbe con el acento real de la paleta activa, no una variable CSS del host", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    await waitFor(() => {
      const orb = screen.getByTestId("sphereswitch-orb");
      const accent = getPaletteById("pizarra-fria")!.colors.accent;
      expect(orb.style.background).toContain(accent);
    });
  });

  it("degrada a un gris neutro si el id activo no está en el catálogo curado", async () => {
    // Límite conocido v1: el orbe solo conoce el catálogo curado (Goal 8),
    // no cualquier paleta que el desarrollador registre por su cuenta.
    const custom = defineConfig({
      palettes: { replace: [{ id: "propia-del-proyecto", colors: { "--color-bg": "#000" } }] },
      fonts: { replace: [{ id: "sans", fonts: { "--font-body": "Inter" } }] },
      layouts: { replace: [{ id: "bento" }] },
    });
    render(
      <SphereSwitchProvider config={custom} injectFoucScript={false}>
        <SphereSwitchWidget />
      </SphereSwitchProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("sphereswitch-orb").style.background).toContain("#8b93a3");
    });
  });

  it("⌘K abre el palette y hacer click en el orbe también", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    expect(screen.queryByPlaceholderText(/buscar/i)).toBeNull();

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => expect(screen.getByPlaceholderText(/buscar/i)).toBeTruthy());

    fireEvent.keyDown(window, { key: "k", metaKey: true }); // toggle: cierra
    await waitFor(() => expect(screen.queryByPlaceholderText(/buscar/i)).toBeNull());

    fireEvent.click(screen.getByTestId("sphereswitch-orb"));
    await waitFor(() => expect(screen.getByPlaceholderText(/buscar/i)).toBeTruthy());
  });
});

describe("SphereSwitchWidget — focus trap", () => {
  it("al abrir, el foco entra en el modal (input de búsqueda)", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByPlaceholderText(/buscar/i));
    });
  });

  it("el modal tiene role=dialog y contiene el input (trap de Radix Dialog activo)", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog.contains(screen.getByPlaceholderText(/buscar/i))).toBe(true);
    });
  });
});

describe("SphereSwitchWidget — centro de comandos (Goal 11)", () => {
  it("⌘⇧P abre el palette ya filtrado a Paletas", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    fireEvent.keyDown(window, { key: "p", metaKey: true, shiftKey: true });
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/buscar/i)).toHaveProperty("value", "Paletas");
    });
  });

  it("⌘⇧/ abre la chuleta con el atajo de cada comando", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    fireEvent.keyDown(window, { key: "/", metaKey: true, shiftKey: true });
    await waitFor(() => expect(screen.getByText("Cambiar paleta")).toBeTruthy());
    expect(screen.getByText("⌘⇧P")).toBeTruthy();
  });

  it("⌘Z deshace el último cambio de combinación (Goal 14)", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => expect(screen.getByPlaceholderText(/buscar/i)).toBeTruthy());

    fireEvent.click(screen.getByText("Tinta China"));
    await waitFor(() => expect(localStorage.getItem("sphereswitch:palette")).toBe("tinta-china"));

    fireEvent.keyDown(window, { key: "z", metaKey: true });
    await waitFor(() => expect(localStorage.getItem("sphereswitch:palette")).toBe("pizarra-fria"));
  });
});

describe("SphereSwitchWidget — selección actualiza el estado real", () => {
  it("elegir una paleta en el palette llama de verdad a setPalette (hooks del Goal 4)", async () => {
    render(<SphereSwitchWidget />, { wrapper });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => expect(screen.getByPlaceholderText(/buscar/i)).toBeTruthy());

    fireEvent.click(screen.getByText("Tinta China"));

    await waitFor(() => {
      expect(localStorage.getItem("sphereswitch:palette")).toBe("tinta-china");
    });
    await waitFor(() => {
      const orb = screen.getByTestId("sphereswitch-orb");
      expect(orb.style.background).toContain(getPaletteById("tinta-china")!.colors.accent);
    });
  });
});

describe("SphereSwitchWidget — aislamiento frente a CSS agresivo del host", () => {
  it("el acento del orbe sigue viniendo del dato, aunque el host inyecte * { ... !important }", async () => {
    const aggressive = document.createElement("style");
    aggressive.textContent = `
      * { color: red !important; font-size: 40px !important; }
      button { background: yellow !important; }
    `;
    document.head.appendChild(aggressive);

    render(<SphereSwitchWidget />, { wrapper });
    await waitFor(() => {
      const orb = screen.getByTestId("sphereswitch-orb");
      // El acento llega por estilo inline, no por una clase que el host pueda pisar.
      expect(orb.style.background).toContain(getPaletteById("pizarra-fria")!.colors.accent);
    });

    // El reset scoped también sobrevive: sigue presente en el <style> inyectado.
    const injected = document.getElementById("sphereswitch-styles");
    expect(injected?.textContent).toContain(".sphereswitch-root");
    expect(injected?.textContent).toContain("all: initial");

    document.head.removeChild(aggressive);
  });

  it("inyecta el <style> una sola vez aunque se llame varias veces", async () => {
    const { injectWidgetStyles } = await import("./styles/inject");
    render(<SphereSwitchWidget />, { wrapper });
    injectWidgetStyles();
    injectWidgetStyles();
    expect(document.querySelectorAll("#sphereswitch-styles")).toHaveLength(1);
  });
});
