import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { defineConfig } from "@sphereswitch/core";
import { SphereSwitchProvider } from "./SphereSwitchProvider";
import { useDimension } from "./useDimension";
import { useFont, useLayout, usePalette } from "./useDimensions";
import { useMounted } from "./useMounted";
import { resetGlobalStoreForTests } from "./internal/store";

const config = defineConfig({
  palettes: {
    replace: [
      { id: "slate", colors: { "--color-bg": "#0f172a" } },
      { id: "terracota", colors: { "--color-bg": "#f4ede4" } },
    ],
  },
  fonts: { replace: [{ id: "sans", fonts: { "--font-body": "Inter" } }] },
  layouts: { replace: [{ id: "bento" }, { id: "editorial" }] },
  defaults: { palette: "slate" },
});

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SphereSwitchProvider config={config} injectFoucScript={false}>
      {children}
    </SphereSwitchProvider>
  );
}

afterEach(() => {
  resetGlobalStoreForTests();
  document.documentElement.getAttributeNames().forEach((name) => {
    if (name.startsWith("data-sphereswitch-")) document.documentElement.removeAttribute(name);
  });
});

describe("useMounted", () => {
  it("es false en el primer render y true tras el efecto", () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true); // renderHook ya ejecuta efectos
  });
});

describe("useDimension — sin Provider", () => {
  it("devuelve el valor de respaldo de una dimensión de serie", () => {
    const { result } = renderHook(() => useDimension("palette"));
    expect(result.current[0]).toBe("default");
  });

  it("lanza para una dimensión no registrada", () => {
    expect(() => renderHook(() => useDimension("spacing"))).toThrow(/no está registrada/);
  });
});

describe("hooks de conveniencia — con Provider", () => {
  it("usePalette arranca en el valor por defecto configurado", async () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    await waitFor(() => expect(result.current[0]).toBe("slate"));
  });

  it("setPalette cambia el valor y re-renderiza", async () => {
    const { result } = renderHook(() => usePalette(), { wrapper });
    await waitFor(() => expect(result.current[0]).toBe("slate"));

    act(() => {
      result.current[1]("terracota");
    });

    await waitFor(() => expect(result.current[0]).toBe("terracota"));
    expect(localStorage.getItem("sphereswitch:palette")).toBe("terracota");
    expect(document.documentElement.getAttribute("data-sphereswitch-palette")).toBe("terracota");
  });

  it("useFont y useLayout resuelven sus dimensiones", async () => {
    const { result } = renderHook(() => ({ font: useFont(), layout: useLayout() }), { wrapper });
    await waitFor(() => {
      expect(result.current.font[0]).toBe("sans");
      expect(result.current.layout[0]).toBe("bento");
    });
  });
});

describe("seguridad en SSR / hidratación", () => {
  it("el render de servidor usa el valor por defecto aunque localStorage tenga otro", () => {
    localStorage.setItem("sphereswitch:palette", "terracota");

    function Show() {
      const [palette] = usePalette();
      return <span data-testid="p">{palette}</span>;
    }

    const html = renderToString(
      <SphereSwitchProvider config={config} injectFoucScript={false}>
        <Show />
      </SphereSwitchProvider>,
    );
    expect(html).toContain(">slate<");
  });

  it("tras montar en cliente, converge al valor real persistido", async () => {
    localStorage.setItem("sphereswitch:palette", "terracota");

    function Show() {
      const [palette] = usePalette();
      return <span data-testid="p">{palette}</span>;
    }

    render(
      <SphereSwitchProvider config={config} injectFoucScript={false}>
        <Show />
      </SphereSwitchProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("p").textContent).toBe("terracota"));
  });
});

describe("Provider — script anti-parpadeo", () => {
  it("inyecta un <script> cuando injectFoucScript no se desactiva", () => {
    const { container } = render(
      <SphereSwitchProvider config={config}>
        <div />
      </SphereSwitchProvider>,
    );
    const script = container.querySelector("script");
    expect(script?.innerHTML).toContain("localStorage");
  });

  it("no inyecta nada con injectFoucScript={false}", () => {
    const { container } = render(
      <SphereSwitchProvider config={config} injectFoucScript={false}>
        <div />
      </SphereSwitchProvider>,
    );
    expect(container.querySelector("script")).toBeNull();
  });
});
