import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runInit } from "./init";

const CORE_TEMPLATES = fileURLToPath(new URL("../../core/templates/", import.meta.url));

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "sphereswitch-cli-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "proyecto-de-prueba" }), "utf8");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("runInit — extremo a extremo sobre el sistema de archivos", () => {
  it("crea sphereswitch.config.ts con el contenido de la plantilla", async () => {
    const code = await runInit({
      cwd: dir,
      language: "ts",
      interactive: false,
      templatesDir: CORE_TEMPLATES,
    });

    expect(code).toBe(0);
    const written = join(dir, "sphereswitch.config.ts");
    expect(existsSync(written)).toBe(true);
    expect(readFileSync(written, "utf8")).toBe(
      readFileSync(join(CORE_TEMPLATES, "sphereswitch.config.ts"), "utf8"),
    );
  });

  it("crea la variante .js cuando se pide JavaScript", async () => {
    await runInit({ cwd: dir, language: "js", interactive: false, templatesDir: CORE_TEMPLATES });

    expect(existsSync(join(dir, "sphereswitch.config.js"))).toBe(true);
    expect(existsSync(join(dir, "sphereswitch.config.ts"))).toBe(false);
  });

  it("no sobrescribe un config existente sin force", async () => {
    writeFileSync(join(dir, "sphereswitch.config.ts"), "// mío", "utf8");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const code = await runInit({
      cwd: dir,
      language: "ts",
      interactive: false,
      templatesDir: CORE_TEMPLATES,
    });

    expect(code).toBe(0);
    expect(readFileSync(join(dir, "sphereswitch.config.ts"), "utf8")).toBe("// mío");
    expect(warn).toHaveBeenCalled();
  });

  it("sobrescribe con force", async () => {
    writeFileSync(join(dir, "sphereswitch.config.ts"), "// mío", "utf8");

    await runInit({
      cwd: dir,
      language: "ts",
      force: true,
      interactive: false,
      templatesDir: CORE_TEMPLATES,
    });

    expect(readFileSync(join(dir, "sphereswitch.config.ts"), "utf8")).not.toBe("// mío");
  });

  it("avisa pero no bloquea si no hay package.json", async () => {
    rmSync(join(dir, "package.json"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const code = await runInit({
      cwd: dir,
      language: "ts",
      interactive: false,
      templatesDir: CORE_TEMPLATES,
    });

    expect(code).toBe(0);
    expect(existsSync(join(dir, "sphereswitch.config.ts"))).toBe(true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("package.json"));
  });

  it("en modo no interactivo exige el lenguaje", async () => {
    await expect(
      runInit({ cwd: dir, interactive: false, templatesDir: CORE_TEMPLATES }),
    ).rejects.toThrow(/language/);
  });
});
