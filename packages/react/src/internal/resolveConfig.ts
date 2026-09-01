import { resolveCatalog, resolveStoreConfig } from "@sphereswitch/core";
import type { SphereSwitchConfig, SphereSwitchUserConfig } from "@sphereswitch/core";

/**
 * Catálogo curado vacío. Se rellenará en los Goals 7–9; hasta entonces, la
 * configuración del desarrollador es la única fuente de entradas.
 */
const EMPTY_CURATED = { palettes: [], fonts: [], layouts: [] } as const;

/** Acepta tanto una config de dimensiones ya resuelta como la salida de `defineConfig`. */
export function toStoreConfig(
  config: SphereSwitchConfig | SphereSwitchUserConfig,
): SphereSwitchConfig {
  if ("dimensions" in config) return config;
  return resolveStoreConfig(resolveCatalog(config, EMPTY_CURATED), config.defaults);
}
