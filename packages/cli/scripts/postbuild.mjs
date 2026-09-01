// Post-build de la CLI: copia las plantillas desde @sphereswitch/core, verifica
// que el shebang sobrevivió al bundle y aplica permisos de ejecución.

import { chmodSync, cpSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cliJs = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const templatesSrc = fileURLToPath(new URL("../../core/templates/", import.meta.url));
const templatesDest = fileURLToPath(new URL("../dist/templates/", import.meta.url));

mkdirSync(templatesDest, { recursive: true });
cpSync(templatesSrc, templatesDest, { recursive: true });

const contents = readFileSync(cliJs, "utf8");
if (!contents.startsWith("#!/usr/bin/env node")) {
  throw new Error("El build de la CLI perdió el shebang de dist/cli.js.");
}

chmodSync(cliJs, 0o755);

console.log("postbuild CLI: plantillas copiadas, shebang verificado, permisos +x aplicados");
