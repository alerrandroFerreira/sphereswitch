// El CustomEvent propio de SphereSwitch. Solo se dispara en la pestaña donde
// ocurrió el cambio; la sincronización entre pestañas la resuelve el store
// escuchando el evento nativo `storage` (ver store.ts).

import type { SphereSwitchChangeDetail } from "./types";

/**
 * Emite el `CustomEvent` de cambio en `window`. No-op si no hay `window`
 * (servidor) o si el entorno no soporta `CustomEvent`.
 */
export function emitChangeEvent(eventName: string, detail: SphereSwitchChangeDetail): void {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  if (typeof CustomEvent !== "function") return;
  window.dispatchEvent(new CustomEvent<SphereSwitchChangeDetail>(eventName, { detail }));
}
