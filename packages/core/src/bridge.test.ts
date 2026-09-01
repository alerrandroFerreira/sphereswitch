import { afterEach, describe, expect, it, vi } from "vitest";

import { connectBridge } from "./bridge";

// WebSocket falso: registra los mensajes enviados y permite disparar eventos.
class FakeWebSocket {
  static OPEN = 1;
  static instances: FakeWebSocket[] = [];
  readyState = 0;
  sent: string[] = [];
  private listeners = new Map<string, Array<(event: unknown) => void>>();

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }
  addEventListener(type: string, fn: (event: unknown) => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(fn);
    this.listeners.set(type, list);
  }
  send(data: string): void {
    this.sent.push(data);
  }
  close(): void {
    this.readyState = 3;
    this.emit("close", {});
  }
  emit(type: string, event: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn(event);
  }
  fakeOpen(): void {
    this.readyState = FakeWebSocket.OPEN;
    this.emit("open", {});
  }
}

afterEach(() => {
  FakeWebSocket.instances = [];
  vi.unstubAllGlobals();
});

describe("connectBridge", () => {
  it("no rompe si no hay WebSocket en el entorno", () => {
    vi.stubGlobal("WebSocket", undefined);
    const status = vi.fn();
    const conn = connectBridge({ url: "ws://x", onStatus: status });
    expect(() => conn.send({ type: "combo" })).not.toThrow();
    expect(status).toHaveBeenCalledWith("closed");
  });

  it("envía mensajes como JSON solo cuando la conexión está abierta", () => {
    vi.stubGlobal("WebSocket", FakeWebSocket);
    const conn = connectBridge({ url: "ws://127.0.0.1:51037", reconnect: false });
    const ws = FakeWebSocket.instances[0]!;

    conn.send({ type: "combo", palette: "x" }); // aún cerrado: se ignora
    expect(ws.sent).toHaveLength(0);

    ws.fakeOpen();
    conn.send({ type: "combo", palette: "x" });
    expect(JSON.parse(ws.sent[0]!)).toEqual({ type: "combo", palette: "x" });
  });

  it("entrega los mensajes entrantes bien formados y descarta el resto", () => {
    vi.stubGlobal("WebSocket", FakeWebSocket);
    const onMessage = vi.fn();
    connectBridge({ url: "ws://x", onMessage, reconnect: false });
    const ws = FakeWebSocket.instances[0]!;

    ws.emit("message", {
      data: JSON.stringify({ type: "combo", tokens: { "--color-bg": "#000" } }),
    });
    ws.emit("message", { data: "no-json" });
    ws.emit("message", { data: JSON.stringify({ sinTipo: true }) });

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith({ type: "combo", tokens: { "--color-bg": "#000" } });
  });

  it("informa del estado connecting -> open -> closed", () => {
    vi.stubGlobal("WebSocket", FakeWebSocket);
    const status = vi.fn();
    const conn = connectBridge({ url: "ws://x", onStatus: status, reconnect: false });
    const ws = FakeWebSocket.instances[0]!;
    ws.fakeOpen();
    conn.close();
    expect(status.mock.calls.map((c) => c[0])).toEqual(["connecting", "open", "closed"]);
  });
});
