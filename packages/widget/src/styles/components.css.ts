// Estilos visuales del orbe y el command palette. Toques puntuales tipo
// blueprint (corchetes, anotación mono) sin saturar; bordes 1.5–2px finos
// pero accesibles; animación rápida sin rebote; el orbe reacciona solo al
// hover, estático en reposo.

export const COMPONENTS_CSS = `
.sphereswitch-orb {
  position: fixed;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: var(--ss-border-width) solid var(--ss-border);
  box-shadow: var(--ss-shadow);
  transition:
    transform var(--ss-duration) var(--ss-ease),
    box-shadow var(--ss-duration) var(--ss-ease);
  filter: blur(0);
}

.sphereswitch-orb:hover,
.sphereswitch-orb:focus-visible {
  transform: scale(1.08);
  box-shadow:
    var(--ss-shadow),
    0 0 0 4px rgb(255 255 255 / 0.06);
}

.sphereswitch-orb[data-position="bottom-right"] {
  bottom: 20px;
  right: 20px;
}
.sphereswitch-orb[data-position="bottom-left"] {
  bottom: 20px;
  left: 20px;
}
.sphereswitch-orb[data-position="top-right"] {
  top: 20px;
  right: 20px;
}
.sphereswitch-orb[data-position="top-left"] {
  top: 20px;
  left: 20px;
}

.sphereswitch-palette-overlay {
  position: fixed;
  inset: 0;
  background: rgb(10 12 16 / 0.55);
  animation: sphereswitch-fade var(--ss-duration) var(--ss-ease);
}

.sphereswitch-palette {
  position: fixed;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  width: min(560px, calc(100vw - 32px));
  max-height: 60vh;
  background: var(--ss-bg-elevated);
  border: var(--ss-border-width) solid var(--ss-border);
  border-radius: var(--ss-radius);
  box-shadow: var(--ss-shadow);
  overflow: hidden;
  animation: sphereswitch-rise var(--ss-duration) var(--ss-ease);
}

.sphereswitch-palette-combo {
  padding: 8px 16px 0;
  font-family: var(--ss-font-mono);
  font-size: 11px;
  color: var(--ss-fg-muted);
}

.sphereswitch-palette [cmdk-input] {
  width: 100%;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-bottom: var(--ss-border-width) solid var(--ss-border);
  color: var(--ss-fg);
  font-family: var(--ss-font-display);
  font-size: 15px;
  outline: none;
}

.sphereswitch-palette [cmdk-list] {
  max-height: calc(60vh - 52px);
  overflow: auto;
  padding: 6px;
}

.sphereswitch-palette [cmdk-group-heading] {
  padding: 8px 10px 4px;
  font-family: var(--ss-font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ss-fg-muted);
}

.sphereswitch-palette [cmdk-group-heading]::before {
  content: "[ ";
}
.sphereswitch-palette [cmdk-group-heading]::after {
  content: " ]";
}

.sphereswitch-palette [cmdk-item] {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--ss-radius-sm);
  cursor: pointer;
}

.sphereswitch-palette [cmdk-item][data-selected="true"] {
  background: var(--ss-border);
}

.sphereswitch-palette [cmdk-item] kbd {
  margin-left: auto;
  font-family: var(--ss-font-mono);
  font-size: 11px;
  color: var(--ss-fg-muted);
}

.sphereswitch-console {
  position: fixed;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  width: min(680px, calc(100vw - 32px));
  height: min(440px, 70vh);
  display: flex;
  flex-direction: column;
  background: var(--ss-bg-elevated);
  border: var(--ss-border-width) solid var(--ss-border);
  border-radius: var(--ss-radius);
  box-shadow: var(--ss-shadow);
  overflow: hidden;
  animation: sphereswitch-rise var(--ss-duration) var(--ss-ease);
}

.sphereswitch-console-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: var(--ss-border-width) solid var(--ss-border);
  font-family: var(--ss-font-mono);
  font-size: 12px;
  color: var(--ss-fg-muted);
}

.sphereswitch-console-bar button {
  font-family: var(--ss-font-mono);
  font-size: 12px;
  padding: 4px 10px;
  border: var(--ss-border-width) solid var(--ss-border);
  border-radius: var(--ss-radius-sm);
  color: var(--ss-fg-muted);
}

.sphereswitch-console-bar button[data-active] {
  color: var(--ss-fg);
  background: var(--ss-border);
}

.sphereswitch-console-bar [role="tablist"] {
  display: inline-flex;
  gap: 4px;
}

.sphereswitch-console-editor {
  flex: 1;
  min-height: 0;
}

.sphereswitch-lab {
  position: fixed;
  top: 14%;
  left: 50%;
  transform: translateX(-50%);
  width: min(480px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  background: var(--ss-bg-elevated);
  border: var(--ss-border-width) solid var(--ss-border);
  border-radius: var(--ss-radius);
  box-shadow: var(--ss-shadow);
  animation: sphereswitch-rise var(--ss-duration) var(--ss-ease);
}

.sphereswitch-lab-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--ss-font-mono);
  font-size: 12px;
  color: var(--ss-fg-muted);
}

.sphereswitch-lab-swatches {
  display: flex;
  gap: 4px;
  height: 40px;
}

.sphereswitch-lab-swatches span {
  flex: 1;
  border-radius: var(--ss-radius-sm);
  border: 1px solid rgb(255 255 255 / 0.1);
}

.sphereswitch-ab {
  position: fixed;
  inset: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: var(--ss-border);
  border: var(--ss-border-width) solid var(--ss-border);
  border-radius: var(--ss-radius);
  overflow: hidden;
  box-shadow: var(--ss-shadow);
}

.sphereswitch-ab-pane {
  position: relative;
  background: var(--ss-bg);
}

.sphereswitch-ab-pane iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.sphereswitch-ab-label {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  padding: 2px 8px;
  border-radius: var(--ss-radius-sm);
  background: var(--ss-bg-elevated);
  border: var(--ss-border-width) solid var(--ss-border);
  font-family: var(--ss-font-mono);
  font-size: 11px;
  color: var(--ss-fg-muted);
}

.sphereswitch-swatch {
  display: inline-flex;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgb(255 255 255 / 0.15);
  flex-shrink: 0;
}

.sphereswitch-font-sample {
  font-family: var(--ss-font-mono);
  font-size: 12px;
  color: var(--ss-fg-muted);
}

@keyframes sphereswitch-fade {
  from {
    opacity: 0;
  }
}

@keyframes sphereswitch-rise {
  from {
    opacity: 0;
    transform: translate(-50%, 6px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sphereswitch-orb,
  .sphereswitch-palette-overlay,
  .sphereswitch-palette,
  .sphereswitch-console {
    animation: none !important;
    transition: none !important;
  }
}
`;
