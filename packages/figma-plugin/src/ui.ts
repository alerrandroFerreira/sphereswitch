// La UI del plugin (corre en un iframe normal, con DOM y WebSocket). Es la
// única pieza que habla con el puente: recibe combinaciones del navegador y
// las reenvía al hilo principal del plugin (code.ts) vía postMessage.

import { connectBridge } from "@sphereswitch/core";
import type { BridgeMessage, BridgeStatus } from "@sphereswitch/core";

const DEFAULT_BRIDGE_URL = "ws://localhost:51037";

const statusEl = document.getElementById("status");
const urlInput = document.getElementById("bridge-url") as HTMLInputElement | null;

function setStatus(status: BridgeStatus): void {
  if (statusEl)
    statusEl.textContent = { connecting: "Conectando…", open: "Conectado", closed: "Sin conexión" }[
      status
    ];
  if (statusEl) statusEl.dataset["status"] = status;
}

function onBridgeMessage(message: BridgeMessage): void {
  if (
    message.type === "combo" &&
    typeof message["tokens"] === "object" &&
    message["tokens"] !== null
  ) {
    parent.postMessage({ pluginMessage: { type: "apply-combo", tokens: message["tokens"] } }, "*");
  }
}

let connection = connectBridge({
  url: (urlInput?.value || DEFAULT_BRIDGE_URL).trim(),
  onMessage: onBridgeMessage,
  onStatus: setStatus,
});

document.getElementById("reconnect")?.addEventListener("click", () => {
  connection.close();
  connection = connectBridge({
    url: (urlInput?.value || DEFAULT_BRIDGE_URL).trim(),
    onMessage: onBridgeMessage,
    onStatus: setStatus,
  });
});
