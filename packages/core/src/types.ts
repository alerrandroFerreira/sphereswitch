// Tipos y constantes compartidos por el núcleo agnóstico de SphereSwitch.

/** Prefijo por defecto de las claves de `localStorage` (`sphereswitch:<dimension>`). */
export const DEFAULT_STORAGE_KEY_PREFIX = "sphereswitch";

/** Prefijo por defecto de los atributos del DOM (`data-sphereswitch-<dimension>`). */
export const DEFAULT_ATTRIBUTE_PREFIX = "sphereswitch";

/** Nombre por defecto del `CustomEvent` emitido en cada cambio. */
export const DEFAULT_EVENT_NAME = "sphereswitch:change";

/** Nombre canónico de la dimensión de tipografía. */
export const DIMENSION_FONT = "font";

/** Nombre canónico de la dimensión de paleta de color. */
export const DIMENSION_PALETTE = "palette";

/** Nombre canónico de la dimensión de layout. */
export const DIMENSION_LAYOUT = "layout";

/** Las tres dimensiones que SphereSwitch registra de serie. */
export const DEFAULT_DIMENSION_NAMES = [
  DIMENSION_FONT,
  DIMENSION_PALETTE,
  DIMENSION_LAYOUT,
] as const;

/** Configuración de una dimensión temática (fuente, paleta, layout, o cualquier extensión futura). */
export interface DimensionConfig {
  /** Identificador único. Se usa tal cual en la clave de `localStorage` y en el atributo `data-*`. */
  readonly name: string;
  /** Lista cerrada de valores admitidos. Debe tener al menos un elemento. */
  readonly values: readonly string[];
  /** Valor por defecto. Debe estar incluido en `values`. */
  readonly defaultValue: string;
}

/** Estado completo del store: un valor activo por cada dimensión registrada. */
export type SphereSwitchState = Readonly<Record<string, string>>;

/** Contenido (`detail`) del `CustomEvent` de cambio. */
export interface SphereSwitchChangeDetail {
  /** Dimensión que cambió. */
  readonly dimension: string;
  /** Valor previo de esa dimensión. */
  readonly previousValue: string;
  /** Valor nuevo de esa dimensión. */
  readonly value: string;
  /** Estado completo tras aplicar el cambio. */
  readonly state: SphereSwitchState;
  /** `true` cuando el cambio llega desde otra pestaña (evento nativo `storage`). */
  readonly external: boolean;
}

/** Configuración de entrada del store. */
export interface SphereSwitchConfig {
  /** Dimensiones registradas. Al menos una, con nombres únicos. */
  readonly dimensions: readonly DimensionConfig[];
  /** Prefijo de las claves de `localStorage`. Por defecto `"sphereswitch"`. */
  readonly storageKeyPrefix?: string;
  /** Prefijo de los atributos `data-*`. Por defecto `"sphereswitch"`. */
  readonly attributePrefix?: string;
  /** Nombre del `CustomEvent` de cambio. Por defecto `"sphereswitch:change"`. */
  readonly eventName?: string;
  /**
   * Elemento donde escribir los atributos `data-*`. Por defecto
   * `document.documentElement`. Se ignora silenciosamente en servidor.
   */
  readonly root?: HTMLElement | null;
}

/** Configuración ya normalizada, con todos los valores por defecto resueltos. */
export interface ResolvedConfig {
  readonly dimensions: readonly DimensionConfig[];
  readonly storageKeyPrefix: string;
  readonly attributePrefix: string;
  readonly eventName: string;
  readonly root: HTMLElement | null;
}

/**
 * API pública del store. Diseñada para encajar con `useSyncExternalStore` sin
 * que el núcleo conozca React: cualquier framework construye su adaptador encima
 * de `subscribe` + `getSnapshot` + `getServerSnapshot`.
 */
export interface SphereSwitchStore {
  /** Registra un listener de cambios. Devuelve la función para darse de baja. */
  subscribe(listener: () => void): () => void;
  /** Estado actual, síncrono. Referencia estable mientras el estado no cambie. */
  getSnapshot(): SphereSwitchState;
  /** Estado por defecto, sin tocar `window`/`document`/`localStorage`. Seguro en SSR. */
  getServerSnapshot(): SphereSwitchState;
  /** Alias explícito de `getSnapshot`, para uso fuera de un adaptador reactivo. */
  getState(): SphereSwitchState;
  /** Valor activo de una dimensión. Lanza si la dimensión no existe. */
  get(dimension: string): string;
  /** Fija el valor de una dimensión y lo persiste. Lanza si la dimensión o el valor no son válidos. */
  set(dimension: string, value: string): void;
  /** Devuelve una dimensión (o todas) a su valor por defecto y borra su clave persistida. */
  reset(dimension?: string): void;
  /** `true` si el estado se está persistiendo en `localStorage`; `false` si es memoria volátil. */
  isPersistent(): boolean;
  /** Configuración normalizada en uso. */
  getConfig(): ResolvedConfig;
  /** Desengancha listeners internos (evento `storage`) y limpia suscriptores. */
  destroy(): void;
}
