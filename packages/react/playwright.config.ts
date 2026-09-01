import { defineConfig, devices } from "@playwright/test";

// Test visual del anti-FOUC (Goal 12). Deliberadamente fuera de `pnpm -r test`:
// necesita un navegador real, no solo Vitest/jsdom. Se conecta al pipeline de
// CI en el Goal 19.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
