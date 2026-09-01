import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defineConfig, getPaletteById } from "@sphereswitch/core";
import { SphereSwitchProvider } from "./SphereSwitchProvider";
import { usePalette } from "./useDimensions";
import { useFigmaBridge } from "./useFigmaBridge";
import { useRemix } from "./useRemix";
import { useSystemSync } from "./useSystemSync";
import { resetGlobalStoreForTests } from "./internal/store";

const config = defineConfig({
  palettes: {
    replace: [
      { id: "tinta-china", colors: { "--color-bg": "#fff" }, mode: "light" },
      { id: "pizarra-fria", colors: { "--color-bg": "#000" }, mode: "dark" },
    ],
  },
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

function mockMatchMedia(dark: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: dark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

beforeEach(() => {
  // el catálogo real tiene ids reales; el config de prueba los reutiliza
  expect(getPaletteById("pizarra-fria")?.mode).toBe("dark");
});

afterEach(() => {
  resetGlobalStoreForTests();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("useSystemSync", () => {
  it("al activarse, ajusta la paleta al modo del sistema (oscuro)", async () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => ({ sync: useSystemSync(), palette: usePalette() }), {
      wrapper,
    });

    expect(result.current.sync.enabled).toBe(false);
    act(() => result.current.sync.toggle());

    await waitFor(() => {
      expect(getPaletteById(result.current.palette[0])?.mode).toBe("dark");
    });
    expect(localStorage.getItem("sphereswitch:system-sync")).toBe("1");
  });
});

describe("useFigmaBridge", () => {
  it("empieza desactivado y persiste el flag al activarlo", () => {
    const { result } = renderHook(() => useFigmaBridge(), { wrapper });
    expect(result.current.enabled).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.enabled).toBe(true);
    expect(localStorage.getItem("sphereswitch:figma-bridge")).toBe("1");
  });
});

describe("useRemix", () => {
  it("descartar la combinación activa impide que el remix la vuelva a proponer", async () => {
    const { result } = renderHook(() => ({ remix: useRemix(), palette: usePalette() }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.palette[0]).toBe("tinta-china"));

    act(() => result.current.remix.rejectCurrent());
    expect(result.current.remix.isRejected()).toBe(true);

    // con solo 2 paletas y una descartada, el remix acaba en la otra
    for (let i = 0; i < 5; i += 1) act(() => result.current.remix.remix());
    await waitFor(() => expect(result.current.palette[0]).toBe("pizarra-fria"));
  });
});
