import { createStore, DEFAULT_DIMENSION_NAMES } from "@sphereswitch/core";
import type { SphereSwitchConfig, SphereSwitchStore } from "@sphereswitch/core";

/**
 * Configuración de respaldo cuando los hooks se usan sin Provider y sin llamar
 * a `configureGlobalStore`. Cada dimensión de serie con un único valor neutro:
 * los hooks devuelven algo coherente y no rompen, pero para cambiar valores
 * hace falta una configuración real.
 */
const FALLBACK_CONFIG: SphereSwitchConfig = {
  dimensions: DEFAULT_DIMENSION_NAMES.map((name) => ({
    name,
    values: ["default"],
    defaultValue: "default",
  })),
};

let globalStore: SphereSwitchStore | null = null;

/** Store global perezoso: se crea con `FALLBACK_CONFIG` la primera vez que se pide. */
export function getGlobalStore(): SphereSwitchStore {
  globalStore ??= createStore(FALLBACK_CONFIG);
  return globalStore;
}

/**
 * Fija la configuración del store global. Útil para proyectos que usan los
 * hooks sin montar `<SphereSwitchProvider>`.
 */
export function configureGlobalStore(config: SphereSwitchConfig): SphereSwitchStore {
  globalStore?.destroy();
  globalStore = createStore(config);
  return globalStore;
}

/** Solo para tests: descarta el store global. */
export function resetGlobalStoreForTests(): void {
  globalStore?.destroy();
  globalStore = null;
}
