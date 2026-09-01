// Reset scoped a `.sphereswitch-root`. Aislamiento pragmático, no absoluto:
// se descarta Shadow DOM real a propósito (complica Monaco en el Goal 13 y el
// manejo de z-index/portales), a cambio de `all: initial` sobre el contenedor
// raíz — evita que el `font-family`/`color`/`line-height` del host se filtren
// hacia dentro, sin llegar al aislamiento total de un Shadow Root.
//
// Limitación documentada (Goal 20): un host con selectores muy agresivos
// (`* { ... } con !important`) puede seguir colándose. El orbe compensa la
// parte más visible de ese riesgo leyendo el color de acento directamente del
// dato de la paleta activa, no de una variable CSS del host (ver Orb.tsx).

export const RESET_CSS = `
.sphereswitch-root {
  all: initial;
  display: block;
  position: fixed;
  z-index: 2147483000;
  font-family: var(--ss-font-body);
  font-size: 14px;
  line-height: 1.4;
  color: var(--ss-fg);
  box-sizing: border-box;
}

.sphereswitch-root *,
.sphereswitch-root *::before,
.sphereswitch-root *::after {
  box-sizing: inherit;
  font-family: inherit;
  margin: 0;
  padding: 0;
}

.sphereswitch-root button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}
`;
