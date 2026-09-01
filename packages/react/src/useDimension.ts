"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useMounted } from "./useMounted";
import { useSphereSwitchStore } from "./useStore";

/** `[valorActual, setValor]`, con la misma forma que `useState`. */
export type DimensionTuple<TValue extends string = string> = readonly [
  TValue,
  (value: TValue) => void,
];

/**
 * Hook genérico de bajo nivel. Es el ÚNICO que llama a `useSyncExternalStore`;
 * `usePalette`, `useFont` y `useLayout` son envoltorios finos sobre este.
 *
 * Hasta que el componente está montado devuelve el valor por defecto (el mismo
 * que emitió el servidor), y solo entonces el valor real persistido — así la
 * hidratación nunca diverge.
 */
export function useDimension(name: string): DimensionTuple {
  const store = useSphereSwitchStore();
  const mounted = useMounted();

  const clientState = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const serverState = store.getServerSnapshot();

  const source = mounted ? clientState : serverState;
  const value = source[name];
  if (value === undefined) {
    throw new Error(
      `[sphereswitch] La dimensión "${name}" no está registrada en la configuración.`,
    );
  }

  const setValue = useCallback(
    (next: string) => {
      store.set(name, next);
    },
    [store, name],
  );

  return [value, setValue];
}
