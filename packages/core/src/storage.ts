// Envoltura sobre `localStorage` que nunca lanza: degrada a memoria volátil
// cuando el almacenamiento no está disponible (modo incógnito, política del
// navegador, ejecución en servidor, cuota agotada).

/** Superficie mínima de `localStorage` que necesita el núcleo. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Almacenamiento normalizado que usa el store. */
export interface SphereSwitchStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  /** `true` si escribe en `localStorage`; `false` si es un respaldo en memoria. */
  readonly persistent: boolean;
}

const PROBE_KEY = "__sphereswitch_probe__";

function createMemoryStorage(): SphereSwitchStorage {
  const map = new Map<string, string>();
  return {
    persistent: false,
    get: (key) => (map.has(key) ? (map.get(key) as string) : null),
    set: (key, value) => {
      map.set(key, value);
    },
    remove: (key) => {
      map.delete(key);
    },
  };
}

function canWrite(storage: StorageLike): boolean {
  try {
    storage.setItem(PROBE_KEY, "1");
    storage.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

function resolveLocalStorage(): StorageLike | null {
  try {
    // El mero acceso a `window.localStorage` puede lanzar por política del navegador.
    if (typeof window === "undefined") return null;
    const ls = window.localStorage;
    return ls && canWrite(ls) ? ls : null;
  } catch {
    return null;
  }
}

/**
 * Construye el almacenamiento del store. Si `localStorage` no es utilizable,
 * devuelve un respaldo en memoria con la misma interfaz — el consumidor nunca
 * ve una excepción por esto.
 */
export function createStorage(): SphereSwitchStorage {
  const backing = resolveLocalStorage();
  if (!backing) return createMemoryStorage();

  return {
    persistent: true,
    get: (key) => {
      try {
        return backing.getItem(key);
      } catch {
        return null;
      }
    },
    set: (key, value) => {
      try {
        backing.setItem(key, value);
      } catch {
        // Cuota agotada o escritura bloqueada: se ignora en silencio.
      }
    },
    remove: (key) => {
      try {
        backing.removeItem(key);
      } catch {
        // Ídem.
      }
    },
  };
}
