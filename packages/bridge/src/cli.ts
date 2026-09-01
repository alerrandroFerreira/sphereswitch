#!/usr/bin/env node
import { DEFAULT_PORT, startBridge } from "./server";

function parsePort(argv: readonly string[]): number {
  const flag = argv.indexOf("--port");
  if (flag !== -1 && argv[flag + 1]) {
    const value = Number.parseInt(argv[flag + 1] as string, 10);
    if (Number.isInteger(value) && value > 0 && value < 65536) return value;
  }
  const fromEnv = process.env["SPHERESWITCH_BRIDGE_PORT"];
  if (fromEnv) {
    const value = Number.parseInt(fromEnv, 10);
    if (Number.isInteger(value) && value > 0 && value < 65536) return value;
  }
  return DEFAULT_PORT;
}

async function main(): Promise<void> {
  const port = parsePort(process.argv.slice(2));
  try {
    const server = await startBridge({
      port,
      onClients: (count) => console.log(`sphereswitch-bridge: ${count} cliente(s) conectado(s)`),
    });
    console.log(`sphereswitch-bridge escuchando en ${server.url} (solo localhost)`);
    console.log("Deja este proceso corriendo junto a tu entorno de desarrollo. Ctrl+C para parar.");

    const shutdown = (): void => {
      void server.close().then(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error(
      `sphereswitch-bridge: no se pudo iniciar en el puerto ${port}:`,
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  }
}

void main();
