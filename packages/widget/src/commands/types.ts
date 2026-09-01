// Vocabulario de atajos, compartido por el registro y por useGlobalShortcut.
// Solo se modela "mod" (Cmd en mac / Ctrl en el resto) + shift + alt — cubre
// todos los atajos de la especificación sin distinguir meta/ctrl a mano.

export interface Shortcut {
  readonly key: string;
  /** Cmd en macOS, Ctrl en el resto. */
  readonly mod?: boolean;
  readonly shift?: boolean;
  readonly alt?: boolean;
}

export interface Command {
  readonly id: string;
  readonly label: string;
  readonly category: string;
  /** Ausente si el comando solo se alcanza desde el palette, sin atajo directo. */
  readonly shortcut?: Shortcut;
  readonly execute: () => void;
}

/** Clave canónica de un atajo, usada como identidad para detectar colisiones. */
export function shortcutKey(shortcut: Shortcut): string {
  return [
    shortcut.mod ? "mod" : "",
    shortcut.shift ? "shift" : "",
    shortcut.alt ? "alt" : "",
    shortcut.key.toLowerCase(),
  ]
    .filter(Boolean)
    .join("+");
}

/** La misma clave canónica, derivada de un KeyboardEvent real. */
export function eventShortcutKey(
  event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">,
): string {
  return [
    event.metaKey || event.ctrlKey ? "mod" : "",
    event.shiftKey ? "shift" : "",
    event.altKey ? "alt" : "",
    event.key.toLowerCase(),
  ]
    .filter(Boolean)
    .join("+");
}

/** Representación legible, para la chuleta (⌘⇧F). */
export function formatShortcut(shortcut: Shortcut): string {
  const label = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  return `${shortcut.mod ? "⌘" : ""}${shortcut.shift ? "⇧" : ""}${shortcut.alt ? "⌥" : ""}${label}`;
}
