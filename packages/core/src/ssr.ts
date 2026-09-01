// Snapshot para servidor. Nunca toca `window`, `document` ni `localStorage`.

import type { SphereSwitchConfig, SphereSwitchState } from "./types";

/**
 * Estado por defecto derivado únicamente de la configuración. Es el valor que
 * un adaptador debe entregar como `getServerSnapshot` durante el render de
 * servidor y el primer render de cliente, para que la hidratación no diverja.
 */
export function getServerState(config: SphereSwitchConfig): SphereSwitchState {
  const entries = config.dimensions.map((dimension) => [dimension.name, dimension.defaultValue]);
  return Object.freeze(Object.fromEntries(entries)) as SphereSwitchState;
}
