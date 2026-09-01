// El mecanismo de estado en sí. Un único store genérico que opera sobre
// "dimensiones" registradas por configuración: fuente, paleta y layout son
// simplemente las tres que vienen de serie. Añadir una cuarta dimensión no
// requiere código nuevo aquí.
//
// El núcleo decide y persiste estado; nunca pinta nada. Lo único que toca del
// DOM es un atributo `data-*` en el elemento raíz.

import { emitChangeEvent } from "./events";
import { createStorage } from "./storage";
import { DEFAULT_ATTRIBUTE_PREFIX, DEFAULT_EVENT_NAME, DEFAULT_STORAGE_KEY_PREFIX } from "./types";
import type {
  DimensionConfig,
  ResolvedConfig,
  SphereSwitchChangeDetail,
  SphereSwitchConfig,
  SphereSwitchState,
  SphereSwitchStore,
} from "./types";

function resolveConfig(config: SphereSwitchConfig): ResolvedConfig {
  if (config.dimensions.length === 0) {
    throw new Error("[sphereswitch] La configuración necesita al menos una dimensión.");
  }

  const seen = new Set<string>();
  for (const dimension of config.dimensions) {
    if (!dimension.name) {
      throw new Error("[sphereswitch] Cada dimensión necesita un `name` no vacío.");
    }
    if (seen.has(dimension.name)) {
      throw new Error(`[sphereswitch] Dimensión duplicada: "${dimension.name}".`);
    }
    seen.add(dimension.name);
    if (dimension.values.length === 0) {
      throw new Error(`[sphereswitch] La dimensión "${dimension.name}" no declara valores.`);
    }
    if (!dimension.values.includes(dimension.defaultValue)) {
      throw new Error(
        `[sphereswitch] El valor por defecto "${dimension.defaultValue}" no está entre los ` +
          `valores de la dimensión "${dimension.name}".`,
      );
    }
  }

  let root: HTMLElement | null = config.root ?? null;
  if (root === null && typeof document !== "undefined") {
    root = document.documentElement;
  }

  return {
    dimensions: config.dimensions,
    storageKeyPrefix: config.storageKeyPrefix ?? DEFAULT_STORAGE_KEY_PREFIX,
    attributePrefix: config.attributePrefix ?? DEFAULT_ATTRIBUTE_PREFIX,
    eventName: config.eventName ?? DEFAULT_EVENT_NAME,
    root,
  };
}

function storageKey(config: ResolvedConfig, dimension: string): string {
  return `${config.storageKeyPrefix}:${dimension}`;
}

function attributeName(config: ResolvedConfig, dimension: string): string {
  return `data-${config.attributePrefix}-${dimension}`;
}

function freezeState(entries: Iterable<readonly [string, string]>): SphereSwitchState {
  return Object.freeze(Object.fromEntries(entries)) as SphereSwitchState;
}

/**
 * Crea un store de SphereSwitch a partir de una configuración de dimensiones.
 * El estado se hidrata desde `localStorage` (con degradación a memoria si no
 * está disponible) y se refleja de inmediato en los atributos `data-*` del
 * elemento raíz.
 */
export function createStore(config: SphereSwitchConfig): SphereSwitchStore {
  const resolved = resolveConfig(config);
  const storage = createStorage();
  const listeners = new Set<() => void>();
  const dimensionsByName = new Map<string, DimensionConfig>(
    resolved.dimensions.map((dimension) => [dimension.name, dimension]),
  );

  const defaultState = freezeState(
    resolved.dimensions.map((dimension) => [dimension.name, dimension.defaultValue] as const),
  );

  function readValid(dimension: DimensionConfig): string {
    const raw = storage.get(storageKey(resolved, dimension.name));
    if (raw !== null && dimension.values.includes(raw)) return raw;
    // Dato corrupto, ausente, o de un formato anterior: se cae al valor por defecto.
    return dimension.defaultValue;
  }

  function hydrate(): SphereSwitchState {
    return freezeState(
      resolved.dimensions.map((dimension) => [dimension.name, readValid(dimension)] as const),
    );
  }

  let state: SphereSwitchState = hydrate();

  function applyAttributes(next: SphereSwitchState): void {
    const root = resolved.root;
    if (!root || typeof root.setAttribute !== "function") return;
    for (const dimension of resolved.dimensions) {
      root.setAttribute(attributeName(resolved, dimension.name), next[dimension.name] as string);
    }
  }

  function notify(): void {
    for (const listener of [...listeners]) listener();
  }

  function commit(
    dimension: string,
    value: string,
    options: { readonly persist: boolean; readonly external: boolean },
  ): void {
    const previousValue = state[dimension] as string;
    if (previousValue === value) return;

    state = freezeState([
      ...Object.entries(state).filter(([key]) => key !== dimension),
      [dimension, value],
    ]);

    if (options.persist) storage.set(storageKey(resolved, dimension), value);
    applyAttributes(state);

    const detail: SphereSwitchChangeDetail = {
      dimension,
      previousValue,
      value,
      state,
      external: options.external,
    };
    emitChangeEvent(resolved.eventName, detail);
    notify();
  }

  function requireDimension(dimension: string): DimensionConfig {
    const found = dimensionsByName.get(dimension);
    if (!found) throw new Error(`[sphereswitch] Dimensión desconocida: "${dimension}".`);
    return found;
  }

  function set(dimension: string, value: string): void {
    const config = requireDimension(dimension);
    if (!config.values.includes(value)) {
      throw new Error(
        `[sphereswitch] Valor "${value}" no válido para la dimensión "${dimension}".`,
      );
    }
    commit(dimension, value, { persist: true, external: false });
  }

  function reset(dimension?: string): void {
    if (dimension === undefined) {
      for (const item of resolved.dimensions) reset(item.name);
      return;
    }
    const config = requireDimension(dimension);
    storage.remove(storageKey(resolved, dimension));
    commit(dimension, config.defaultValue, { persist: false, external: false });
  }

  // Sincronización entre pestañas: el navegador dispara `storage` en las OTRAS
  // pestañas cuando cambia `localStorage`, nunca en la que hizo el cambio.
  function onStorageEvent(event: StorageEvent): void {
    const affected =
      event.key === null
        ? resolved.dimensions
        : resolved.dimensions.filter(
            (dimension) => storageKey(resolved, dimension.name) === event.key,
          );
    for (const dimension of affected) {
      commit(dimension.name, readValid(dimension), { persist: false, external: true });
    }
  }

  const canListen = typeof window !== "undefined" && typeof window.addEventListener === "function";
  if (canListen) window.addEventListener("storage", onStorageEvent);

  // Reflejar el estado hidratado en el DOM cuanto antes.
  applyAttributes(state);

  let destroyed = false;

  return {
    subscribe(listener) {
      if (destroyed) return () => {};
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    getServerSnapshot: () => defaultState,
    getState: () => state,
    get: (dimension) => {
      requireDimension(dimension);
      return state[dimension] as string;
    },
    set,
    reset,
    isPersistent: () => storage.persistent,
    getConfig: () => resolved,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.clear();
      if (canListen) window.removeEventListener("storage", onStorageEvent);
    },
  };
}
