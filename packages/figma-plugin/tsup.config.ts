import { defineConfig } from "tsup";

// El sandbox de Figma no soporta módulos ESM: `code.ts` y `ui.ts` se empaquetan
// como IIFE con todo dentro. postbuild.mjs inserta el bundle de la UI dentro de
// ui.html para dejar un único archivo autocontenido.
export default defineConfig({
  entry: ["src/code.ts", "src/ui.ts"],
  format: ["iife"],
  tsconfig: "tsconfig.build.json",
  dts: false,
  clean: true,
  sourcemap: false,
  target: "es2020",
  noExternal: [/.*/],
  outExtension: () => ({ js: ".js" }),
});
