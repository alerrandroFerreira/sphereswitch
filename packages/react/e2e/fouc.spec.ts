// Verificación visual del anti-FOUC (Goal 12). Un test unitario no puede
// demostrar ausencia de parpadeo: hace falta un navegador real, con la red
// simulada a velocidad lenta, comparando el atributo de tema aplicado en el
// primer frame contra el ya estabilizado. Si difieren, hay FOUC real.

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

import { generateFoucScript } from "@sphereswitch/core";
import type { SphereSwitchConfig } from "@sphereswitch/core";

const config: SphereSwitchConfig = {
  dimensions: [
    { name: "palette", values: ["slate", "terracota"], defaultValue: "slate" },
    { name: "font", values: ["sans", "serif"], defaultValue: "sans" },
  ],
};

function writeFixture(): string {
  const script = generateFoucScript(config);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <script>${script}</script>
  </head>
  <body>
    <!-- simula un recurso pesado que llega después de la primera pintura -->
    <img src="./no-existe.png" onerror="this.remove()" />
    <p id="marker">contenido</p>
  </body>
</html>`;
  const dir = mkdtempSync(join(tmpdir(), "sphereswitch-fouc-"));
  const file = join(dir, "index.html");
  writeFileSync(file, html, "utf8");
  return pathToFileURL(file).toString();
}

test.describe("anti-FOUC", () => {
  test("con un valor guardado, el atributo correcto ya está en el primer frame, incluso con red lenta", async ({
    page,
    context,
  }) => {
    const url = writeFixture();

    // Sembrado ANTES de que corra cualquier script de la página — simula una
    // visita recurrente con una paleta no-por-defecto ya persistida.
    await context.addInitScript(() => {
      localStorage.setItem("sphereswitch:palette", "terracota");
      localStorage.setItem("sphereswitch:font", "serif");
    });

    // Red simulada lenta vía CDP: el script debe seguir siendo síncrono y
    // bloqueante sin importar la velocidad de red del resto de recursos.
    const client = await context.newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 400,
      downloadThroughput: (50 * 1024) / 8,
      uploadThroughput: (20 * 1024) / 8,
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const firstFrame = await page.evaluate(() => ({
      palette: document.documentElement.getAttribute("data-sphereswitch-palette"),
      font: document.documentElement.getAttribute("data-sphereswitch-font"),
    }));

    await page.waitForLoadState("load");

    const stabilized = await page.evaluate(() => ({
      palette: document.documentElement.getAttribute("data-sphereswitch-palette"),
      font: document.documentElement.getAttribute("data-sphereswitch-font"),
    }));

    // El valor real ya está ahí en el primer frame, no el de por defecto.
    expect(firstFrame.palette).toBe("terracota");
    expect(firstFrame.font).toBe("serif");

    // Y nunca diverge del estado ya estabilizado: sin parpadeo.
    expect(firstFrame).toEqual(stabilized);
  });

  test("sin nada guardado, aplica el valor por defecto ya en el primer frame", async ({ page }) => {
    const url = writeFixture();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const firstFrame = await page.evaluate(() => ({
      palette: document.documentElement.getAttribute("data-sphereswitch-palette"),
      font: document.documentElement.getAttribute("data-sphereswitch-font"),
    }));

    expect(firstFrame).toEqual({ palette: "slate", font: "sans" });
  });

  test("el parámetro ?sphereswitch-preview gana sobre localStorage ya en el primer frame", async ({
    page,
    context,
  }) => {
    const url = new URL(writeFixture());
    url.searchParams.set("sphereswitch-preview", "palette:terracota,font:serif");

    await context.addInitScript(() => {
      localStorage.setItem("sphereswitch:palette", "slate");
    });

    await page.goto(url.toString(), { waitUntil: "domcontentloaded" });

    const firstFrame = await page.evaluate(() => ({
      palette: document.documentElement.getAttribute("data-sphereswitch-palette"),
      font: document.documentElement.getAttribute("data-sphereswitch-font"),
    }));
    expect(firstFrame).toEqual({ palette: "terracota", font: "serif" });
  });

  test("un valor corrupto en localStorage cae al por defecto, sin romper el primer frame", async ({
    page,
    context,
  }) => {
    const url = writeFixture();
    await context.addInitScript(() => {
      localStorage.setItem("sphereswitch:palette", "un-id-que-no-existe");
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const palette = await page.evaluate(() =>
      document.documentElement.getAttribute("data-sphereswitch-palette"),
    );
    expect(palette).toBe("slate");
  });
});
