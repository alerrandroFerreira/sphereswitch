import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { defineConfig } from "@sphereswitch/core";
import { SphereSwitchProvider } from "./SphereSwitchProvider";
import { usePalette } from "./useDimensions";
import { useComboName } from "./useComboName";
import { useHistory } from "./useHistory";
import { resetGlobalStoreForTests } from "./internal/store";

const config = defineConfig({
  palettes: {
    replace: [
      { id: "tinta-china", colors: { "--color-bg": "#fff" } },
      { id: "pizarra-fria", colors: { "--color-bg": "#000" } },
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

afterEach(() => {
  resetGlobalStoreForTests();
  localStorage.clear();
});

describe("useHistory", () => {
  it("expone deshacer/rehacer y refleja los cambios de combinación", async () => {
    const { result } = renderHook(() => ({ history: useHistory(), palette: usePalette() }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.palette[0]).toBe("tinta-china"));
    expect(result.current.history.canUndo).toBe(false);

    act(() => result.current.palette[1]("pizarra-fria"));
    await waitFor(() => expect(result.current.history.canUndo).toBe(true));

    act(() => {
      result.current.history.undo();
    });
    await waitFor(() => expect(result.current.palette[0]).toBe("tinta-china"));
    expect(result.current.history.canRedo).toBe(true);

    act(() => {
      result.current.history.redo();
    });
    await waitFor(() => expect(result.current.palette[0]).toBe("pizarra-fria"));
  });
});

describe("useComboName", () => {
  it("da un nombre estable a la combinación activa", async () => {
    const { result, rerender } = renderHook(() => useComboName(), { wrapper });
    await waitFor(() => expect(result.current).toMatch(/^Tinta China \S+ #\d+$/));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("cambia al cambiar de combinación y vuelve al mismo nombre al volver", async () => {
    const { result } = renderHook(() => ({ name: useComboName(), palette: usePalette() }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.name).toContain("Tinta China"));
    const original = result.current.name;

    act(() => result.current.palette[1]("pizarra-fria"));
    await waitFor(() => expect(result.current.name).toContain("Pizarra Fría"));

    act(() => result.current.palette[1]("tinta-china"));
    await waitFor(() => expect(result.current.name).toBe(original));
  });
});
