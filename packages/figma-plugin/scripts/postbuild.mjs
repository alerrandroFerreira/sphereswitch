// Deja ui.html autocontenido (con el bundle de la UI inline) — Figma sirve la
// UI como un único archivo, no resuelve <script src> hermanos. Verifica también
// que el manifest no pide más red de la necesaria.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const uiJs = readFileSync(fileURLToPath(new URL("dist/ui.js", root)), "utf8");
const template = readFileSync(fileURLToPath(new URL("src/ui.html", root)), "utf8");

const inlined = template.replace(/<script src="ui\.js"><\/script>/, `<script>\n${uiJs}\n</script>`);
if (inlined === template) throw new Error('No se encontró <script src="ui.js"> en src/ui.html.');
writeFileSync(fileURLToPath(new URL("dist/ui.html", root)), inlined, "utf8");

const manifest = JSON.parse(readFileSync(fileURLToPath(new URL("manifest.json", root)), "utf8"));
const domains = manifest.networkAccess?.allowedDomains ?? [];
const offending = domains.filter(
  (domain) => !/^wss?:\/\/(localhost|127\.0\.0\.1)(:\*|:\d+)?$/.test(domain),
);
if (offending.length > 0) {
  throw new Error(`manifest.json permite red no local: ${offending.join(", ")}`);
}

console.log("postbuild figma-plugin: ui.html autocontenido; manifest solo permite localhost");
