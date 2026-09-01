// Cliente del puente de sincronización en vivo (Goal 18). Usa el `WebSocket`
// nativo del navegador / de la UI del plugin de Figma — cero dependencias.
// El servidor del puente es un proceso Node aparte (`sphereswitch-bridge`).

export interface BridgeMessage {
  /** Tipo de mensaje; el puente solo reenvía, no interpreta. */
  readonly type: string;
  readonly [key: string]: unknown;
}

export type BridgeStatus = "connecting" | "open" | "closed";

export interface BridgeConnection {
  send(message: BridgeMessage): void;
  close(): void;
}

export interface ConnectBridgeOptions {
  /** URL del puente local, p. ej. `ws://127.0.0.1:51037`. */
  readonly url: string;
  readonly onMessage?: (message: BridgeMessage) => void;
  readonly onStatus?: (status: BridgeStatus) => void;
  /** Reintentar la conexión al caerse. Por defecto `true`. */
  readonly reconnect?: boolean;
}

const RECONNECT_MIN_MS = 500;
const RECONNECT_MAX_MS = 8000;

/**
 * Conecta al puente y devuelve un handle. No-op seguro si no hay `WebSocket`
 * (SSR, entornos sin red): `send` se ignora y el estado queda en `closed`.
 */
export function connectBridge(options: ConnectBridgeOptions): BridgeConnection {
  const { url, onMessage, onStatus, reconnect = true } = options;

  if (typeof WebSocket === "undefined") {
    onStatus?.("closed");
    return { send: () => {}, close: () => {} };
  }

  let socket: WebSocket | null = null;
  let closedByUser = false;
  let backoff = RECONNECT_MIN_MS;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  function open(): void {
    onStatus?.("connecting");
    socket = new WebSocket(url);

    socket.addEventListener("open", () => {
      backoff = RECONNECT_MIN_MS;
      onStatus?.("open");
    });

    socket.addEventListener("message", (event: MessageEvent) => {
      if (!onMessage) return;
      try {
        const parsed: unknown = JSON.parse(String(event.data));
        if (
          parsed &&
          typeof parsed === "object" &&
          typeof (parsed as BridgeMessage).type === "string"
        ) {
          onMessage(parsed as BridgeMessage);
        }
      } catch {
        // mensaje no-JSON: se ignora
      }
    });

    socket.addEventListener("close", () => {
      onStatus?.("closed");
      socket = null;
      if (closedByUser || !reconnect) return;
      retryTimer = setTimeout(open, backoff);
      backoff = Math.min(backoff * 2, RECONNECT_MAX_MS);
    });

    socket.addEventListener("error", () => {
      socket?.close();
    });
  }

  open();

  return {
    send(message) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    },
    close() {
      closedByUser = true;
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      socket?.close();
    },
  };
}
