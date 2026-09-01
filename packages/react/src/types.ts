import type { ReactNode } from "react";
import type { SphereSwitchConfig, SphereSwitchUserConfig } from "@sphereswitch/core";

export interface SphereSwitchProviderProps {
  /**
   * Configuración de SphereSwitch. Acepta la salida de `defineConfig` o una
   * configuración de dimensiones ya resuelta.
   */
  readonly config: SphereSwitchConfig | SphereSwitchUserConfig;
  readonly children?: ReactNode;
  /**
   * Inyecta el `<script>` bloqueante anti-parpadeo en el árbol. Actívalo solo
   * en el Provider colocado en el layout raíz. Por defecto `true`.
   */
  readonly injectFoucScript?: boolean;
  /** `nonce` de CSP para el `<script>` inyectado. */
  readonly nonce?: string;
}
