import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as prompts from "@clack/prompts";
import { BUNDLED_TEMPLATES_DIR, CONFIG_BASENAMES, readTemplate } from "./template";
import type { ConfigLanguage } from "./template";

export interface InitOptions {
  /** Directorio de trabajo. Por defecto `process.cwd()`, nunca una ruta "detectada". */
  readonly cwd?: string;
  /** Lenguaje del archivo. Si se indica, no se pregunta. */
  readonly language?: ConfigLanguage;
  /** Sobrescribe un config existente sin preguntar. */
  readonly force?: boolean;
  /** `false` desactiva los prompts (tests). Requiere `language`. */
  readonly interactive?: boolean;
  /** Directorio de plantillas. Por defecto, el empaquetado junto a la CLI. */
  readonly templatesDir?: string;
}

const NEXT_STEPS = [
  "Siguientes pasos:",
  "  1. Instala los paquetes:  pnpm add @sphereswitch/react @sphereswitch/widget",
  "  2. Envuelve tu app con <SphereSwitchProvider config={config}> en el layout raíz",
  "  3. Usa usePalette() / useFont() / useLayout() en cualquier componente",
].join("\n");

export async function runInit(options: InitOptions = {}): Promise<number> {
  const cwd = options.cwd ?? process.cwd();
  const interactive = options.interactive ?? true;
  const templatesDir = options.templatesDir ?? BUNDLED_TEMPLATES_DIR;

  if (interactive) prompts.intro("sphereswitch init");

  if (!existsSync(join(cwd, "package.json"))) {
    const message =
      "No se encontró package.json en este directorio. ¿Seguro que es la carpeta correcta?";
    if (interactive) prompts.log.warn(message);
    else console.warn(`[sphereswitch] ${message}`);
  }

  const existing = CONFIG_BASENAMES.find((name) => existsSync(join(cwd, name)));
  if (existing !== undefined && options.force !== true) {
    if (!interactive) {
      console.warn(`[sphereswitch] Ya existe ${existing}. Usa la opción force para reemplazarlo.`);
      return 0;
    }
    const replace = await prompts.confirm({
      message: `Ya existe ${existing}. ¿Reemplazarlo?`,
      initialValue: false,
    });
    if (prompts.isCancel(replace)) {
      prompts.cancel("Operación cancelada.");
      return 1;
    }
    if (!replace) {
      prompts.outro(`Se conserva ${existing}. Nada que hacer.`);
      return 0;
    }
  }

  let language = options.language;
  if (language === undefined) {
    if (!interactive) {
      throw new Error("runInit no interactivo requiere la opción `language`.");
    }
    const answer = await prompts.select({
      message: "¿En qué lenguaje quieres el archivo de configuración?",
      options: [
        { value: "ts" as const, label: "TypeScript", hint: "autocompletado de ids" },
        { value: "js" as const, label: "JavaScript" },
      ],
    });
    if (prompts.isCancel(answer)) {
      prompts.cancel("Operación cancelada.");
      return 1;
    }
    language = answer;
  }

  const targetName = `sphereswitch.config.${language}`;
  writeFileSync(join(cwd, targetName), readTemplate(language, templatesDir), "utf8");

  const summary = `Creado ${targetName}\n\n${NEXT_STEPS}`;
  if (interactive) prompts.outro(summary);
  else console.log(summary);

  return 0;
}
