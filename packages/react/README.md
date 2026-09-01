# @sphereswitch/react

Hooks de React sobre [`@sphereswitch/core`](../core), construidos con
`useSyncExternalStore`. El `<SphereSwitchProvider>` es opcional: los hooks
funcionan sin él.

## Instalación

```
pnpm add @sphereswitch/react @sphereswitch/core
```

`react` (>= 18, la primera versión con `useSyncExternalStore`) es una
`peerDependency`.

## Uso

```tsx
"use client";
import { usePalette } from "@sphereswitch/react";

function PaletteSwitcher() {
  const [palette, setPalette] = usePalette();
  return (
    <select value={palette} onChange={(e) => setPalette(e.target.value)}>
      <option value="slate">Slate</option>
      <option value="terracota">Terracota</option>
    </select>
  );
}
```

### Provider (opcional)

```tsx
import { SphereSwitchProvider } from "@sphereswitch/react";
import config from "./sphereswitch.config";

// layout raíz
export default function RootLayout({ children }) {
  return <SphereSwitchProvider config={config}>{children}</SphereSwitchProvider>;
}
```

Aporta tres cosas: recibe la configuración una sola vez, inyecta el script
anti-parpadeo en el `<head>` (`injectFoucScript`, `true` por defecto — actívalo
solo en el Provider raíz) y resuelve la hidratación en un único sitio.

## Hooks

| Hook                                         | Devuelve                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `useDimension(name)`                         | `[valor, setValor]` para cualquier dimensión. El genérico de bajo nivel. |
| `usePalette()` / `useFont()` / `useLayout()` | Ídem con la dimensión fijada; autocompletan los ids registrados.         |
| `useMounted()`                               | `false` en el primer render, `true` tras montar.                         |
| `useSphereSwitchStore()`                     | El store activo (Provider o global).                                     |

Sin Provider: `configureGlobalStore(config)` fija la configuración del store
global.

## `LayoutSwitch`

Renderiza la variante de layout activa. Un único array (`LayoutVariant[]`) es a
la vez el metadato y el mecanismo de render — nunca hace falta mantener dos
sitios sincronizados al añadir una variante. No asume que las variantes sean
páginas completas: sirve igual para una sección suelta.

```tsx
import { LayoutSwitch } from "@sphereswitch/react";
import { lazy } from "react";

<LayoutSwitch
  fallback={<p>Cargando…</p>}
  variants={[
    {
      id: "bento",
      name: "Bento",
      description: "Rejilla",
      component: lazy(() => import("./Bento")),
    },
    {
      id: "editorial",
      name: "Editorial",
      description: "Revista",
      component: lazy(() => import("./Editorial")),
    },
  ]}
/>;
```

Carga perezosa real: solo la variante activa pesa en el bundle. Antes de montar
pinta siempre la primera variante (SSR-safe, igual patrón que el resto de hooks).

## SSR

Los hooks devuelven el valor por defecto hasta que el componente monta, de modo
que el primer render de cliente coincide con el del servidor. Combínalo con el
script anti-parpadeo para que no haya destello.

MIT
