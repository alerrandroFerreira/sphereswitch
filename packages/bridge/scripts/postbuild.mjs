// Verifica el shebang del binario y le da permisos de ejecución.
import { chmodSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
if (!readFileSync(cli, "utf8").startsWith("#!/usr/bin/env node")) {
  throw new Error("El build perdió el shebang de dist/cli.js.");
}
chmodSync(cli, 0o755);
console.log("postbuild bridge: shebang verificado, permisos +x aplicados");
