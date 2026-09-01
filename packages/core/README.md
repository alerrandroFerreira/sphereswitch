# @sphereswitch/core

Motor de theming en tiempo real, agnóstico de framework. Persiste el identificador
activo de cada _dimensión_ (fuente, paleta, layout, o cualquier extensión propia)
en `localStorage` y lo refleja en un atributo `data-*` del elemento raíz. No pinta
nada: es el CSS del proyecto consumidor el que reacciona a ese atributo.

## Instalación

```
pnpm add @sphereswitch/core
```

## Uso

```ts
import { createStore } from "@sphereswitch/core";

const store = createStore({
  dimensions: [
    { name: "font", values: ["sans", "serif", "mono"], defaultValue: "sans" },
    { name: "palette", values: ["slate", "terracotta"], defaultValue: "slate" },
    { name: "layout", values: ["bento", "editorial"], defaultValue: "bento" },
  ],
});

store.set("palette", "terracotta");
// -> localStorage["sphereswitch:palette"] = "terracotta"
// -> <html data-sphereswitch-palette="terracotta">
// -> window dispatch "sphereswitch:change"
```

## API

| Método                                     | Descripción                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `subscribe(listener)`                      | Registra un listener; devuelve la función de baja. Compatible con `useSyncExternalStore`. |
| `getSnapshot()`                            | Estado actual, síncrono. Referencia estable mientras no cambie.                           |
| `getServerSnapshot()`                      | Estado por defecto, sin tocar `window`/`localStorage`. Seguro en SSR.                     |
| `get(dimension)` / `set(dimension, value)` | Lee / fija el valor de una dimensión.                                                     |
| `reset(dimension?)`                        | Devuelve una dimensión (o todas) a su valor por defecto.                                  |
| `isPersistent()`                           | `false` si `localStorage` no está disponible y se usa memoria volátil.                    |
| `destroy()`                                | Desengancha listeners internos.                                                           |

### Anti-FOUC

```ts
import { generateFoucScript } from "@sphereswitch/core";

const script = generateFoucScript(config); // string de JS vanilla para el <head>
```

### SSR

```ts
import { getServerState } from "@sphereswitch/core";

const serverState = getServerState(config); // estado por defecto, sin efectos
```

## Configuración y catálogos curados

```ts
import { defineConfig } from "@sphereswitch/core";

const config = defineConfig({
  palettes: { extend: [{ id: "propia", colors: { "--color-bg": "#fff" } }] },
});
```

`extend` suma al catálogo curado; `replace` lo sustituye por completo.

Incluye dos catálogos curados, ambos con licencia real documentada:

- **24 parejas tipográficas** (`FONT_PAIRS`) — Google Fonts y Fontshare, con
  carga perezosa (`applyFontPair`, `googleFontsHref`, `fontshareHref`): solo se
  descarga la pareja activa.
- **20 paletas de color** (`PALETTES`) — todas cumplen WCAG AA
  (`contrastRatio` calculado, no solo declarado; `contrastRatio`/`meetsWcagAa`
  en `data/color.ts` para verificar las tuyas).

Las entradas que se inspiran en algo reconocible marcan `isApproximation` y
`approximationNote`, en términos neutros — nunca el nombre de una marca.

## Historial y utilidades

- `createHistory(store)` — pila de hasta 50 combinaciones en `localStorage` (con
  su propia clave), con cursor de deshacer/rehacer: cualquier cambio nuevo tras
  deshacer trunca el futuro.
- `createComboNamer()` — nombres automáticos `<paleta> <adjetivo> #<n>`; el
  número no se reutiliza nunca y la misma combinación siempre recibe el mismo
  nombre.
- `generateExport({ font, palette }, "css" | "tailwind" | "json")` — la
  combinación activa como CSS, snippet de Tailwind o JSON de tokens; un único
  generador para los tres formatos.
- `createRejectedCombos()` — combinaciones marcadas como descartadas (mismo
  esquema de hash que los nombres automáticos); el remix aleatorio las filtra.
- `pickPaletteForMode(id, "light" | "dark")` — paleta curada que encaja con el
  esquema de color del sistema operativo.

## Almacenamiento

Casi todo se persiste en `localStorage` con claves con espacio de nombres. La
**única excepción** son las estadísticas de uso (`createUsageStats`), que usan
**IndexedDB**: son datos que crecen con el tiempo y `localStorage` es síncrono y
de tamaño ajustado. Es una decisión deliberada, no una inconsistencia. Las
estadísticas son **estrictamente locales** — nada se envía a ningún servidor.

## Garantías

- **Cero dependencias de producción.**
- Degradación limpia cuando `localStorage` no está disponible (incógnito, política
  del navegador, servidor): estado en memoria, sin excepciones.
- Sincronización entre pestañas mediante el evento nativo `storage`.
- Valores corruptos o de formatos anteriores caen al valor por defecto.

MIT
