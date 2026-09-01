import type { AddressInfo } from "node:net";
import { WebSocket, WebSocketServer } from "ws";
import { afterEach, describe, expect, it } from "vitest";

import { startBridge } from "./server";

let running: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  await Promise.all(running.map((server) => server.close()));
  running = [];
});

function track<T extends { close: () => Promise<void> }>(server: T): T {
  running.push(server);
  return server;
}

function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const probe = new WebSocketServer({ host: "127.0.0.1", port: 0 });
    probe.on("listening", () => {
      const port = (probe.address() as AddressInfo).port;
      probe.close(() => resolve(port));
    });
  });
}

describe("startBridge", () => {
  it("escucha solo en localhost (127.0.0.1)", async () => {
    const server = track(await startBridge({ port: await freePort() }));
    expect(server.url).toMatch(/^ws:\/\/127\.0\.0\.1:\d+$/);
    expect(server.url).not.toContain("0.0.0.0");
  });

  it("reenvía un mensaje de un cliente a los demás, no al emisor", async () => {
    const server = track(await startBridge({ port: await freePort() }));
    const a = new WebSocket(server.url);
    const b = new WebSocket(server.url);
    await Promise.all([once(a, "open"), once(b, "open")]);

    const received: string[] = [];
    b.on("message", (data) => received.push(String(data)));
    const selfEcho: string[] = [];
    a.on("message", (data) => selfEcho.push(String(data)));

    a.send(JSON.stringify({ type: "combo", palette: "x" }));
    await new Promise((r) => setTimeout(r, 50));

    expect(received).toHaveLength(1);
    expect(JSON.parse(received[0]!)).toMatchObject({ type: "combo", palette: "x" });
    expect(selfEcho).toHaveLength(0);

    a.close();
    b.close();
  });

  it("informa del número de clientes conectados", async () => {
    const counts: number[] = [];
    const server = track(
      await startBridge({ port: await freePort(), onClients: (n) => counts.push(n) }),
    );
    const client = new WebSocket(server.url);
    await once(client, "open");
    expect(counts.at(-1)).toBe(1);
    client.close();
    await new Promise((r) => setTimeout(r, 50));
    expect(counts.at(-1)).toBe(0);
  });
});

function once(socket: WebSocket, event: string): Promise<void> {
  return new Promise((resolve) => socket.once(event, () => resolve()));
}
