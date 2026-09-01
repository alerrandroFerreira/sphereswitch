# sphereswitch-bridge

Puente WebSocket local para la sincronización en vivo entre SphereSwitch (en el
navegador) y el plugin de Figma. Es un relay mínimo: reenvía cada mensaje de un
cliente a los demás, sin interpretarlo.

## Uso

```
npx sphereswitch-bridge          # escucha en ws://127.0.0.1:51037
npx sphereswitch-bridge --port 8080
```

También `SPHERESWITCH_BRIDGE_PORT`. Deja el proceso corriendo junto a tu entorno
de desarrollo.

## Seguridad

Escucha **solo en `127.0.0.1`**, nunca en `0.0.0.0`. Un WebSocket sin
autenticación expuesto a la red permitiría a cualquiera en la misma red local
cambiar el estado del plugin. La dirección no es configurable a una interfaz
externa, a propósito.

MIT
