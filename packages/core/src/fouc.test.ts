import { afterEach, describe, expect, it } from "vitest";

import { generateFoucScript } from "./fouc";
import type { SphereSwitchConfig } from "./types";

const config: SphereSwitchConfig = {
  dimensions: [
    { name: "font", values: ["sans", "serif"], defaultValue: "sans" },
    { name: "palette", values: ["slate", "terracotta"], defaultValue: "slate" },
  ],
};

afterEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/");
  document.documentElement.getAttributeNames().forEach((name) => {
    if (name.startsWith("data-sphereswitch-")) document.documentElement.removeAttribute(name);
  });
});

describe("generateFoucScript", () => {
  it("produce un IIFE que no rompe al ejecutarse sin nada guardado", () => {
    const script = generateFoucScript(config);
    expect(script.startsWith("(function(){")).toBe(true);
    new Function(script)();
    expect(document.documentElement.getAttribute("data-sphereswitch-font")).toBe("sans");
    expect(document.documentElement.getAttribute("data-sphereswitch-palette")).toBe("slate");
  });

  it("aplica el valor guardado válido antes de la primera pintura", () => {
    localStorage.setItem("sphereswitch:palette", "terracotta");
    new Function(generateFoucScript(config))();
    expect(document.documentElement.getAttribute("data-sphereswitch-palette")).toBe("terracotta");
  });

  it("ignora un valor guardado inválido y usa el defecto", () => {
    localStorage.setItem("sphereswitch:font", "wingdings");
    new Function(generateFoucScript(config))();
    expect(document.documentElement.getAttribute("data-sphereswitch-font")).toBe("sans");
  });

  it("el parámetro de preview de la URL gana sobre localStorage", () => {
    localStorage.setItem("sphereswitch:palette", "slate");
    history.replaceState(null, "", "/?sphereswitch-preview=palette:terracotta,font:serif");
    new Function(generateFoucScript(config))();
    expect(document.documentElement.getAttribute("data-sphereswitch-palette")).toBe("terracotta");
    expect(document.documentElement.getAttribute("data-sphereswitch-font")).toBe("serif");
  });

  it("un valor de preview inválido cae al defecto, sin romper", () => {
    history.replaceState(null, "", "/?sphereswitch-preview=palette:fantasma");
    new Function(generateFoucScript(config))();
    expect(document.documentElement.getAttribute("data-sphereswitch-palette")).toBe("slate");
  });

  it("sin parámetro de preview, sigue funcionando exactamente igual que antes", () => {
    localStorage.setItem("sphereswitch:palette", "terracotta");
    new Function(generateFoucScript(config))();
    expect(document.documentElement.getAttribute("data-sphereswitch-palette")).toBe("terracotta");
  });

  it("neutraliza `<` para no poder cerrar el <script> inline", () => {
    const script = generateFoucScript({
      dimensions: [{ name: "x", values: ["</script>"], defaultValue: "</script>" }],
    });
    expect(script).not.toContain("</script>");
    expect(script).toContain("\\u003c");
  });
});
