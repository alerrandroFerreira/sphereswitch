import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  tsconfig: "tsconfig.build.json",
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2022",
  // splitting: la consola de Monaco (import perezoso) queda en un chunk
  // aparte, para que el bundler del proyecto consumidor pueda diferirla.
  splitting: true,
  external: [
    "react",
    "react-dom",
    "cmdk",
    "@radix-ui/react-dialog",
    "@monaco-editor/react",
    "monaco-editor",
    "@sphereswitch/core",
    "@sphereswitch/react",
  ],
  // Todo el paquete es código de cliente (igual que @sphereswitch/react):
  // treeshake desactivado porque su paso por rollup elimina la directiva.
  banner: { js: '"use client";' },
});
