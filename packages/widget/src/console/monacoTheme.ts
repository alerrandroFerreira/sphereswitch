// Tema propio de Monaco, en la familia gris-azulada del resto del widget
// (sección 2.5) — que se vea como si viviera dentro de SphereSwitch, no como
// un componente pegado con otro estilo.

import type { editor } from "monaco-editor";

export const MONACO_THEME_NAME = "sphereswitch";

export const sphereswitchMonacoTheme: editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "e7eaf0", background: "1b1f26" },
    { token: "comment", foreground: "8b93a3", fontStyle: "italic" },
    { token: "variable", foreground: "9ecbff" },
    { token: "attribute.name", foreground: "9ecbff" },
    { token: "attribute.value", foreground: "e7eaf0" },
    { token: "keyword", foreground: "c4b5fd" },
    { token: "string", foreground: "a7f3d0" },
    { token: "number", foreground: "fca5a5" },
  ],
  colors: {
    "editor.background": "#1b1f26",
    "editor.foreground": "#e7eaf0",
    "editorLineNumber.foreground": "#3a4150",
    "editor.selectionBackground": "#2a2f3a",
    "editor.lineHighlightBackground": "#1f242c",
    "editorCursor.foreground": "#8b93a3",
    "editorWidget.background": "#1b1f26",
    "editorWidget.border": "#2a2f3a",
  },
};

/** Opciones fijas: es una consola de VISTA, de solo lectura, sin adornos de editor. */
export const READONLY_CONSOLE_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  domReadOnly: true,
  minimap: { enabled: false },
  lineNumbers: "off",
  folding: false,
  scrollBeyondLastLine: false,
  renderLineHighlight: "none",
  overviewRulerLanes: 0,
  guides: { indentation: false },
  contextmenu: false,
  fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
  fontSize: 13,
  padding: { top: 12, bottom: 12 },
};
