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

## SSR y anti-parpadeo (FOUC)

Los hooks devuelven el valor por defecto hasta que el componente monta, de modo
que el primer render de cliente coincide con el del servidor.

El `<SphereSwitchProvider>` inyecta además un `<script>` bloqueante en el árbol
(por defecto; `injectFoucScript={false}` lo desactiva). Ese script hace **una
sola lectura síncrona** de `localStorage` para **todas** las dimensiones
registradas y aplica todos los atributos `data-*` antes de la primera pintura —
así no hay destello de tema incorrecto al recargar. Colócalo en el layout raíz.

En Next.js App Router:

```tsx
// app/layout.tsx
import { SphereSwitchProvider } from "@sphereswitch/react";
import config from "../sphereswitch.config";

export default function RootLayout({ children }) {
  return <SphereSwitchProvider config={config}>{children}</SphereSwitchProvider>;
}
```

**Content-Security-Policy estricta:** un script inline necesita un `nonce`, o el
navegador lo bloquea **en silencio** (sin error visible, con parpadeo de vuelta).
Pásalo por la prop `nonce`, con el mismo valor que uses en la cabecera CSP:

```tsx
<SphereSwitchProvider config={config} nonce={nonce}>
```

MIT
