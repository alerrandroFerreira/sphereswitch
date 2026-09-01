// Servidor del puente: un relay WebSocket mínimo. Cualquier mensaje de un
// cliente se reenvía a todos los demás — el puente no interpreta el contenido.
//
// ⚠️ Seguridad: escucha SOLO en localhost (127.0.0.1), nunca en 0.0.0.0. Un
// WebSocket sin autenticación expuesto a la red sería una puerta abierta a que
// cualquiera en la misma red local cambie el estado del plugin. La dirección
// no es configurable a una interfaz externa a propósito.

import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

export const DEFAULT_PORT = 51037;
const HOST = "127.0.0.1";

export interface BridgeServer {
  readonly port: number;
  readonly url: string;
  close(): Promise<void>;
}

export interface StartBridgeOptions {
  readonly port?: number;
  /** Se llama en cada cambio del número de clientes conectados. */
  readonly onClients?: (count: number) => void;
}

export function startBridge(options: StartBridgeOptions = {}): Promise<BridgeServer> {
  const port = options.port ?? DEFAULT_PORT;

  return new Promise((resolve, reject) => {
    const wss = new WebSocketServer({ host: HOST, port });

    wss.on("listening", () => {
      resolve({
        port,
        url: `ws://${HOST}:${port}`,
        close: () =>
          new Promise<void>((done) => {
            for (const client of wss.clients) client.terminate();
            wss.close(() => done());
          }),
      });
    });

    wss.on("error", (error) => reject(error));

    wss.on("connection", (socket: WebSocket) => {
      options.onClients?.(wss.clients.size);

      socket.on("message", (data, isBinary) => {
        for (const client of wss.clients) {
          if (client !== socket && client.readyState === client.OPEN) {
            client.send(data, { binary: isBinary });
          }
        }
      });

      socket.on("close", () => options.onClients?.(wss.clients.size));
    });
  });
}
