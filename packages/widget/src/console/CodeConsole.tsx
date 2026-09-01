"use client";

// El editor Monaco embebido. Este archivo NUNCA se importa de forma estática en
// el resto del widget — se carga con React.lazy solo cuando el comando "ver
// consola" se ejecuta por primera vez (ver ConsolePanel). `@monaco-editor/react`
// carga Monaco desde un CDN, así que sus megabytes no entran en el bundle del
// proyecto consumidor.

import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import {
  MONACO_THEME_NAME,
  READONLY_CONSOLE_OPTIONS,
  sphereswitchMonacoTheme,
} from "./monacoTheme";

export interface CodeConsoleProps {
  readonly value: string;
  readonly language?: string;
}

function defineTheme(monaco: Monaco): void {
  monaco.editor.defineTheme(MONACO_THEME_NAME, sphereswitchMonacoTheme);
}

export default function CodeConsole({ value, language = "css" }: CodeConsoleProps) {
  return (
    <Editor
      value={value}
      language={language}
      theme={MONACO_THEME_NAME}
      beforeMount={defineTheme}
      options={READONLY_CONSOLE_OPTIONS}
      height="100%"
      loading={<span className="sphereswitch-font-sample">Cargando la consola…</span>}
    />
  );
}
