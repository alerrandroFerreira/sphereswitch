import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  tsconfig: "tsconfig.build.json",
  dts: false,
  clean: true,
  sourcemap: true,
  target: "es2022",
  // El shebang de src/cli.ts se conserva en el bundle; scripts/postbuild.mjs
  // lo verifica y aplica permisos de ejecución.
});
