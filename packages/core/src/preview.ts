// Modo preview: un parámetro de consulta que fuerza una combinación concreta
// por encima de lo que diga `localStorage`, solo para ese render. Lo usa la
// comparación A/B (Goal 15): dos iframes del mismo origen comparten el mismo
// `localStorage`, así que sin esto ambos leerían la misma combinación y la
// comparación no compararía nada.
//
// Formato: `?sphereswitch-preview=palette:terracota-serena,font:canela`

export const PREVIEW_PARAM = "sphereswitch-preview";

/** Marca de "renderizado dentro de un iframe de comparación": el widget no se monta. */
export const EMBED_PARAM = "sphereswitch-embed";

/** Parsea el valor del parámetro (`palette:x,font:y`) a `{ palette: "x", font: "y" }`. */
export function parsePreviewValue(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  const result: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const index = pair.indexOf(":");
    if (index <= 0) continue;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (key && value) result[key] = value;
  }
  return result;
}

/** Serializa `{ palette: "x", font: "y" }` al formato del parámetro. */
export function serializePreviewValue(combo: Record<string, string | undefined>): string {
  return Object.entries(combo)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => `${key}:${value}`)
    .join(",");
}

/** Lee la combinación forzada de `window.location`, o `{}` en servidor / sin parámetro. */
export function readPreviewFromLocation(): Record<string, string> {
  if (typeof window === "undefined" || typeof window.location === "undefined") return {};
  try {
    return parsePreviewValue(new URLSearchParams(window.location.search).get(PREVIEW_PARAM));
  } catch {
    return {};
  }
}

/** `true` si la URL marca este render como iframe embebido de comparación. */
export function isEmbeddedPreview(): boolean {
  if (typeof window === "undefined" || typeof window.location === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has(EMBED_PARAM);
  } catch {
    return false;
  }
}
