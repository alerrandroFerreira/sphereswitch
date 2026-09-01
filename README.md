# SphereSwitch

Motor de theming en tiempo real —tipografía, paleta de color y layout— para
aplicaciones web, distribuido como paquetes de npm bajo licencia MIT.

> **Estado:** en construcción. El núcleo, el adaptador de React, el sistema de
> configuración y la CLI ya son usables. El widget visual, el plugin de Figma y
> el sitio de documentación aún no. Este README se irá completando a medida que
> lo haga la librería.

## Idea

SphereSwitch **nunca pinta nada**. Escribe un identificador en un atributo
`data-*` sobre `<html>` y lo persiste en `localStorage`; es el CSS de tu propio
proyecto el que reacciona a ese atributo mediante custom properties.

Esa separación hace que el producto sea trivial de retirar: el CSS que ya tenías
sigue funcionando aunque desinstales el paquete.

```css
:root {
  --color-bg: #ffffff;
  --color-fg: #111111;
}

[data-sphereswitch-palette="terracota-serena"] {
  --color-bg: #f4ede4;
  --color-fg: #2b2320;
  --color-accent: #c56a4a;
}

body {
  background: var(--color-bg);
  color: var(--color-fg);
}
```

SphereSwitch solo decide que el atributo pase a valer `terracota-serena`. El
resto es tu hoja de estilos.

## Paquetes

| Paquete                                 | Qué es                                                                                                                                | Estado    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| [`@sphereswitch/core`](packages/core)   | Motor de estado agnóstico de framework: persistencia, atributos `data-*`, evento propio, API de suscripción y catálogo de tipografías | Usable    |
| [`@sphereswitch/react`](packages/react) | Hooks (`usePalette`, `useFont`, `useLayout`) y `<SphereSwitchProvider>` opcional                                                      | Usable    |
| [`sphereswitch`](packages/cli)          | CLI: `npx sphereswitch init` copia la plantilla de configuración                                                                      | Usable    |
| `@sphereswitch/widget`                  | Orbe flotante, command palette y consola de código                                                                                    | En camino |
| `@sphereswitch/figma-plugin`            | Plugin de Figma con sincronización en vivo                                                                                            | En camino |

## Inicio rápido

```bash
# 1. Genera el archivo de configuración
npx sphereswitch init

# 2. Instala el adaptador
pnpm add @sphereswitch/react @sphereswitch/core
```

```tsx
// app/layout.tsx  (o el punto más alto de tu árbol)
import { SphereSwitchProvider } from "@sphereswitch/react";
import config from "../sphereswitch.config";

export default function RootLayout({ children }) {
  return <SphereSwitchProvider config={config}>{children}</SphereSwitchProvider>;
}
```

```tsx
"use client";
import { usePalette } from "@sphereswitch/react";

export function PaletteSwitcher() {
  const [palette, setPalette] = usePalette();
  const next = palette === "terracota-serena" ? "pizarra-fria" : "terracota-serena";
  return <button onClick={() => setPalette(next)}>Cambiar paleta</button>;
}
```

Los hooks también funcionan sin Provider; en ese caso, `configureGlobalStore(config)`
fija la configuración una vez al arrancar la app.

## Configuración

`sphereswitch.config.ts` registra tus paletas, tipografías y layouts. El catálogo
curado de serie se combina con lo que añadas:

```ts
import { defineConfig } from "@sphereswitch/core";

export default defineConfig({
  palettes: {
    // `extend` SUMA al catálogo curado; `replace` lo sustituye por completo
    extend: [
      {
        id: "terracota-serena",
        label: "Terracota Serena",
        colors: { "--color-bg": "#f4ede4", "--color-fg": "#2b2320", "--color-accent": "#c56a4a" },
      },
      {
        id: "pizarra-fria",
        label: "Pizarra Fría",
        colors: { "--color-bg": "#0f172a", "--color-fg": "#e2e8f0", "--color-accent": "#38bdf8" },
      },
    ],
  },
  defaults: { palette: "terracota-serena" },
});
```

Convención fija de nombres de variables CSS: `--color-*` para paletas, `--font-*`
para tipografías. Está reforzada en los tipos: un nombre fuera de convención es
un error de compilación.

## Garantías del núcleo

- **Cero dependencias de producción.**
- **SSR seguro:** el snapshot de servidor nunca toca `window` ni `localStorage`;
  combinado con el script anti-parpadeo (`generateFoucScript`), no hay destello
  de tema incorrecto al cargar.
- **Degradación limpia:** si `localStorage` no está disponible (incógnito,
  política del navegador), el estado vive en memoria sin lanzar excepciones.
- **Sincronización entre pestañas** mediante el evento nativo `storage`.
- Los valores corruptos o de formatos anteriores caen al valor por defecto.

## Convenciones

- Claves de `localStorage`: `sphereswitch:<dimensión>` (p. ej. `sphereswitch:palette`).
- Atributos del DOM: `data-sphereswitch-<dimensión>` sobre `<html>`.
- Evento: `sphereswitch:change`, con `detail` que incluye la dimensión y los
  valores anterior y nuevo.

## Catálogo de tipografías

`@sphereswitch/core` incluye 24 parejas tipográficas curadas (Google Fonts y
Fontshare), todas con licencia abierta. Las que se inspiran en una tipografía de
pago lo declaran con transparencia y nunca se presentan como la fuente original.
La carga de archivos de fuente es perezosa: solo se descarga la pareja activa.

## Desarrollo

Monorepo con pnpm workspaces.

```bash
pnpm install
pnpm -r build      # compila todos los paquetes
pnpm -r test       # Vitest
pnpm typecheck     # tsc -b sobre todo el árbol
```

## Licencia

MIT © Alerrandro Heron Ferreira
