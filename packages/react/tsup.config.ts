import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  tsconfig: "tsconfig.build.json",
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2022",
  external: ["react", "react-dom", "@sphereswitch/core"],
  // Todo el paquete es código de cliente: cada export depende de hooks de
  // React. La directiva a nivel de bundle lo declara así para consumidores
  // con React Server Components. (treeshake desactivado: su paso por rollup
  // elimina la directiva del bundle final.)
  banner: { js: '"use client";' },
});
