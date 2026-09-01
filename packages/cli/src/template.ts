// El contenido real de sphereswitch.config vive en @sphereswitch/core
// (packages/core/templates/, escrito en el Goal 5). El build de la CLI lo copia
// a dist/templates/ y aquí se lee de disco — así nunca se desincroniza de la
// fuente única.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Nombres de archivo de configuración que la CLI reconoce y genera. */
export const CONFIG_BASENAMES = ["sphereswitch.config.ts", "sphereswitch.config.js"] as const;

export type ConfigLanguage = "ts" | "js";

/** Directorio de plantillas empaquetado junto a la CLI (dist/templates/). */
export const BUNDLED_TEMPLATES_DIR = fileURLToPath(new URL("./templates/", import.meta.url));

/** Lee el contenido de la plantilla para el lenguaje pedido. */
export function readTemplate(
  language: ConfigLanguage,
  templatesDir = BUNDLED_TEMPLATES_DIR,
): string {
  return readFileSync(join(templatesDir, `sphereswitch.config.${language}`), "utf8");
}
