import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  tsconfig: "tsconfig.build.json",
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: "es2022",
  external: ["@sphereswitch/core"],
});
