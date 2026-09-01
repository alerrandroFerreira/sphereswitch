import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/server.ts", "src/cli.ts"],
  format: ["esm"],
  tsconfig: "tsconfig.build.json",
  dts: { entry: ["src/index.ts", "src/server.ts"] },
  clean: true,
  sourcemap: true,
  target: "es2022",
  external: ["ws"],
});
