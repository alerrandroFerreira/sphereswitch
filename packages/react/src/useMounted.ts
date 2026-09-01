"use client";

import { useEffect, useState } from "react";

/**
 * `false` en el primer render (servidor y primera pintura del cliente); `true`
 * a partir del efecto de montaje.
 *
 * Es la pieza que evita el desajuste de hidratación: mientras devuelve `false`,
 * los hooks exponen el mismo valor por defecto que emitió el servidor; solo
 * cuando pasa a `true` se lee el valor real de `localStorage`.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
