"use client";

import { useEffect, useMemo, useRef } from "react";
import { createStore, generateFoucScript } from "@sphereswitch/core";
import type { SphereSwitchStore } from "@sphereswitch/core";
import { SphereSwitchContext } from "./context";
import { toStoreConfig } from "./internal/resolveConfig";
import type { SphereSwitchProviderProps } from "./types";

/**
 * Provider opcional. Los hooks funcionan sin él; el Provider aporta tres cosas:
 * recibir la configuración una sola vez en la raíz, inyectar el script
 * anti-parpadeo, y ser el único punto donde se resuelve la hidratación.
 *
 * Colócalo una vez, lo más arriba posible del árbol.
 */
export function SphereSwitchProvider({
  config,
  children,
  injectFoucScript = true,
  nonce,
}: SphereSwitchProviderProps) {
  const resolved = useMemo(() => toStoreConfig(config), [config]);

  // El store se crea una sola vez, en el primer render (resistente al doble
  // render de StrictMode). La configuración se lee al montar; para cambiarla,
  // vuelve a montar el Provider con una `key` distinta.
  const storeRef = useRef<SphereSwitchStore | null>(null);
  storeRef.current ??= createStore(resolved);
  const store = storeRef.current;

  useEffect(() => () => store.destroy(), [store]);

  const foucScript = useMemo(
    () => (injectFoucScript ? generateFoucScript(resolved) : null),
    [injectFoucScript, resolved],
  );

  return (
    <SphereSwitchContext.Provider value={store}>
      {foucScript !== null ? (
        <script
          // El script aplica el valor real antes de la hidratación; la
          // diferencia con el árbol servido es intencionada.
          suppressHydrationWarning
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: foucScript }}
        />
      ) : null}
      {children}
    </SphereSwitchContext.Provider>
  );
}
