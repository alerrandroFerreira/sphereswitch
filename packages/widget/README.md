# @sphereswitch/widget

El orbe flotante y el command palette (⌘K) de SphereSwitch. Importación 100%
opcional: quien solo quiera el motor no arrastra ni una línea de este paquete.

## Uso

```tsx
import { SphereSwitchWidget } from "@sphereswitch/widget";

<SphereSwitchWidget position="bottom-right" />;
```

`position` es la **única** prop de apariencia — el resto del look es fijo, la
firma visual de SphereSwitch.

## Aislamiento visual

Sin Shadow DOM (complicaría Monaco en el Goal 13 y el manejo de z-index). En
su lugar, un contenedor `.sphereswitch-root` con `all: initial` y un reset
propio, scoped a esa clase. Es pragmático, no absoluto: un host con
selectores muy agresivos (`* { ... } !important`) puede seguir colándose. El
orbe compensa la parte más visible de ese riesgo leyendo el color de acento
directamente del dato de la paleta activa (catálogo de `@sphereswitch/core`),
no de una variable CSS del proyecto — si el orbe cambia de color pero la
página no, el problema está en el CSS del host, no en SphereSwitch.

El orbe (y el preview del palette) solo conocen el color de las entradas del
**catálogo curado**; una paleta que el desarrollador registre por su cuenta se
ve en gris neutro hasta que ese cableado se generalice.

## Command palette

Construido sobre [`cmdk`](https://cmdk.paco.me/), que ya porta a
`document.body` y aplica el focus trap de Radix Dialog — sin código propio de
portal ni de trampa de foco. Tres secciones separadas por tipo (Fuentes /
Paletas / Layouts), nunca mezcladas.

MIT
