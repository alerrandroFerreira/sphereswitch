// Corre en el sandbox de la API de plugins de Figma: sin `window`, sin `fetch`
// garantizado, sin `localStorage` del navegador. Toda comunicación con el
// exterior pasa por el WebSocket del puente, y el puente lo maneja la UI del
// plugin (ui.ts) — este archivo solo habla con esa UI vía `figma.ui`.

import { hexToFigmaRgb, isColorToken, tokenToVariableName } from "./tokens";

interface ApplyComboMessage {
  readonly type: "apply-combo";
  readonly tokens: Record<string, string>;
}

function isApplyComboMessage(value: unknown): value is ApplyComboMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "apply-combo" &&
    typeof (value as { tokens?: unknown }).tokens === "object"
  );
}

async function applyCombo(tokens: Record<string, string>): Promise<void> {
  const variables = await figma.variables.getLocalVariablesAsync();
  const byName = new Map(variables.map((variable) => [variable.name, variable] as const));

  for (const [token, value] of Object.entries(tokens)) {
    if (!isColorToken(token)) continue;
    const variable = byName.get(tokenToVariableName(token));
    if (!variable) continue;
    const modeId = variable.valuesByMode ? Object.keys(variable.valuesByMode)[0] : undefined;
    if (!modeId) continue;
    variable.setValueForMode(modeId, hexToFigmaRgb(value));
  }
}

figma.showUI(__html__, { width: 260, height: 160, title: "SphereSwitch — sincronización" });

figma.ui.onmessage = (message: unknown) => {
  if (isApplyComboMessage(message)) {
    void applyCombo(message.tokens);
  }
};
