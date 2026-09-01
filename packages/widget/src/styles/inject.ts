// Inyecta la hoja de estilos del widget una sola vez, sin necesitar que quien
// instala el paquete recuerde importar un .css aparte — es el precio de
// mantener la instalación en un solo paso.

import { COMPONENTS_CSS } from "./components.css";
import { RESET_CSS } from "./reset.css";
import { TOKENS_CSS } from "./tokens.css";

const STYLE_ELEMENT_ID = "sphereswitch-styles";

/** La hoja completa, expuesta para tests de accesibilidad. */
export const WIDGET_STYLES_FOR_TESTS = [RESET_CSS, TOKENS_CSS, COMPONENTS_CSS].join("\n");

export function injectWidgetStyles(doc: Document = document): void {
  if (doc.getElementById(STYLE_ELEMENT_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.setAttribute("data-sphereswitch-styles", "");
  style.textContent = WIDGET_STYLES_FOR_TESTS;
  doc.head.appendChild(style);
}
