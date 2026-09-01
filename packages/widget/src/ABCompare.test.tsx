import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { defineConfig } from "@sphereswitch/core";
import { SphereSwitchProvider } from "@sphereswitch/react";
import { ABCompare, previewUrl } from "./ABCompare";
import { SphereSwitchWidget } from "./SphereSwitchWidget";

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
  history.replaceState(null, "", "/");
});

describe("previewUrl", () => {
  it("fuerza la combinación y marca el iframe como embebido", () => {
    const url = new URL(previewUrl({ palette: "tinta-china", font: "canela" }));
    expect(url.searchParams.get("sphereswitch-preview")).toBe("palette:tinta-china,font:canela");
    expect(url.searchParams.get("sphereswitch-embed")).toBe("1");
  });

  it("descarta un parámetro de preview previo de la URL", () => {
    history.replaceState(null, "", "/?sphereswitch-preview=palette:vieja&otro=1");
    const url = new URL(previewUrl({ palette: "nueva" }));
    expect(url.searchParams.get("sphereswitch-preview")).toBe("palette:nueva");
    expect(url.searchParams.get("otro")).toBe("1");
  });
});

function previewOf(el: Element | null): string {
  return (
    new URL(el?.getAttribute("src") ?? "http://x/").searchParams.get("sphereswitch-preview") ?? ""
  );
}

describe("ABCompare", () => {
  it("renderiza dos iframes con combinaciones distintas", () => {
    render(
      <ABCompare
        open
        onOpenChange={() => {}}
        comboA={{ palette: "pizarra-fria" }}
        comboB={{ palette: "tinta-china" }}
      />,
      { wrapper },
    );
    const a = screen.getByTestId("ab-frame-a");
    const b = screen.getByTestId("ab-frame-b");
    expect(previewOf(a)).toBe("palette:pizarra-fria");
    expect(previewOf(b)).toBe("palette:tinta-china");
    expect(a.getAttribute("src")).not.toBe(b.getAttribute("src"));
  });
});

describe("SphereSwitchWidget — comparación A/B", () => {
  it("⌘⇧A abre la comparación con la combinación actual y la anterior", async () => {
    render(<SphereSwitchWidget />, { wrapper });

    // genera historial: pasa a tinta-china
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => expect(screen.getByPlaceholderText(/buscar/i)).toBeTruthy());
    fireEvent.click(screen.getByText("Tinta China"));
    await waitFor(() => expect(localStorage.getItem("sphereswitch:palette")).toBe("tinta-china"));

    fireEvent.keyDown(window, { key: "a", metaKey: true, shiftKey: true });

    await waitFor(() => {
      expect(previewOf(screen.getByTestId("ab-frame-a"))).toContain("palette:tinta-china");
      expect(previewOf(screen.getByTestId("ab-frame-b"))).toContain("palette:pizarra-fria");
    });
  });

  it("dentro de un iframe embebido, el widget no se monta", () => {
    history.replaceState(null, "", "/?sphereswitch-embed=1");
    const { container } = render(<SphereSwitchWidget />, { wrapper });
    expect(container.querySelector("[data-sphereswitch-widget-root]")).toBeNull();
  });
});
