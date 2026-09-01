# @sphereswitch/figma-plugin

Plugin de Figma que refleja en vivo la combinación de tema activa en el
navegador. Corre en el sandbox de la API de plugins de Figma (sin `window`, sin
`fetch` garantizado, sin `localStorage` del navegador); toda comunicación con el
exterior pasa por el puente [`sphereswitch-bridge`](../bridge).

## Puesta en marcha

1. `npx sphereswitch-bridge` — arranca el puente local.
2. En el navegador, activa "Sincronizar con Figma" en el widget (`⌘⇧B`).
3. En Figma: _Plugins → Development → Import plugin from manifest_ y elige el
   `manifest.json` de este paquete.

Cada cambio de fuente o paleta en el navegador actualiza las variables locales
de Figma (`color/bg`, `color/fg`, `color/accent`, …) del archivo abierto.

## Seguridad

`manifest.json` solo permite red hacia `ws://localhost:*` / `ws://127.0.0.1:*` —
ninguna red externa. Verificado en el paso de post-build.

MIT
