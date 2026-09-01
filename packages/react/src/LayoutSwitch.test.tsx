import { lazy } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { defineConfig } from "@sphereswitch/core";
import { SphereSwitchProvider } from "./SphereSwitchProvider";
import { LayoutSwitch } from "./LayoutSwitch";
import type { LayoutVariant } from "./LayoutSwitch";
import { resetGlobalStoreForTests } from "./internal/store";

const config = defineConfig({
  layouts: { replace: [{ id: "bento" }, { id: "editorial" }, { id: "brutalist" }] },
  palettes: { replace: [{ id: "x", colors: { "--color-bg": "#000" } }] },
  fonts: { replace: [{ id: "y", fonts: { "--font-body": "Inter" } }] },
  defaults: { layout: "bento" },
});

const A = () => <div data-testid="v">bento</div>;
const B = () => <div data-testid="v">editorial</div>;
const C = () => <div data-testid="v">brutalist</div>;

const variants: LayoutVariant[] = [
  { id: "bento", name: "Bento", description: "grid", component: A },
  { id: "editorial", name: "Editorial", description: "revista", component: B },
  { id: "brutalist", name: "Brutalist", description: "crudo", component: C },
];

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SphereSwitchProvider config={config} injectFoucScript={false}>
      {children}
    </SphereSwitchProvider>
  );
}

afterEach(() => {
  resetGlobalStoreForTests();
});

describe("LayoutSwitch", () => {
  it("renderiza la variante correspondiente al estado activo", async () => {
    localStorage.setItem("sphereswitch:layout", "editorial");
    render(<LayoutSwitch variants={variants} />, { wrapper });
    await waitFor(() => expect(screen.getByTestId("v").textContent).toBe("editorial"));
  });

  it("antes de montar pinta la primera variante (SSR determinista)", () => {
    localStorage.setItem("sphereswitch:layout", "brutalist");
    const html = renderToString(
      <SphereSwitchProvider config={config} injectFoucScript={false}>
        <LayoutSwitch variants={variants} />
      </SphereSwitchProvider>,
    );
    expect(html).toContain(">bento<");
    expect(html).not.toContain(">brutalist<");
  });

  it("el cambio de variante en vivo no genera warnings de React", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("sphereswitch:layout", "bento");

    const { rerender } = render(<LayoutSwitch variants={variants} />, { wrapper });
    await waitFor(() => expect(screen.getByTestId("v").textContent).toBe("bento"));

    localStorage.setItem("sphereswitch:layout", "brutalist");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "sphereswitch:layout", storageArea: localStorage }),
    );
    rerender(<LayoutSwitch variants={variants} />);

    await waitFor(() => expect(screen.getByTestId("v").textContent).toBe("brutalist"));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("soporta componentes perezosos con el fallback de Suspense", async () => {
    const Lazy = lazy(() =>
      Promise.resolve({ default: () => <div data-testid="v">perezoso</div> }),
    );
    const lazyVariants: LayoutVariant[] = [
      { id: "bento", name: "Bento", description: "", component: Lazy },
    ];

    render(<LayoutSwitch variants={lazyVariants} fallback={<span>cargando</span>} />, {
      wrapper,
    });
    expect(screen.getByText("cargando")).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId("v").textContent).toBe("perezoso"));
  });

  it("con variants vacío pinta el fallback sin romper", () => {
    render(<LayoutSwitch variants={[]} fallback={<span data-testid="fb">nada</span>} />, {
      wrapper,
    });
    expect(screen.getByTestId("fb")).toBeTruthy();
  });
});
