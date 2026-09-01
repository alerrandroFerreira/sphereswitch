// Punto de entrada de librería (helpers reutilizables). El plugin en sí se
// arranca desde Figma con dist/code.js + dist/ui.html.

export { hexToFigmaRgb, tokenToVariableName, isColorToken } from "./tokens";
export type { FigmaRgb } from "./tokens";
