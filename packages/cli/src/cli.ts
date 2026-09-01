#!/usr/bin/env node
import { runInit } from "./init";

async function main(): Promise<void> {
  const command = process.argv[2];

  if (command !== undefined && command !== "init") {
    console.error(`Comando desconocido: "${command}". Uso: sphereswitch init`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = await runInit();
}

void main();
