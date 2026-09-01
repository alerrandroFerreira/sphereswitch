// Estrategia de carga perezosa de fuentes.
//
// El problema que resuelve (marcado como grave en la auditoría): no cargar las
// 24 parejas de golpe. Cada `FontPair` es solo dato; los `<link>` que traen los
// archivos se inyectan únicamente cuando esa pareja está activa, y se retiran
// los de la pareja anterior.
//
// Quién dispara `applyFontPair` (al recibir `sphereswitch:change` de la
// dimensión `font`) es responsabilidad del widget — Goal 10.

import type { FontFace, FontPair } from "./fonts";

const MANAGED_LINK_ATTR = "data-sphereswitch-font";

function uniqueSortedWeights(weights: readonly number[]): number[] {
  return [...new Set(weights)].sort((a, b) => a - b);
}

/** URL de hoja de estilos de Google Fonts para las caras servidas desde ahí. */
export function googleFontsHref(faces: readonly FontFace[]): string | null {
  const families = faces.filter((face) => face.source === "google-fonts");
  if (families.length === 0) return null;
  const params = families
    .map((face) => {
      const name = face.family.replace(/ /g, "+");
      const weights = uniqueSortedWeights(face.weights).join(";");
      return `family=${name}:wght@${weights}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** URL de hoja de estilos de Fontshare para las caras servidas desde ahí. */
export function fontshareHref(faces: readonly FontFace[]): string | null {
  const families = faces.filter((face) => face.source === "fontshare");
  if (families.length === 0) return null;
  const params = families
    .map((face) => {
      const slug = face.family.toLowerCase().replace(/ /g, "-");
      const weights = uniqueSortedWeights(face.weights).join(",");
      return `f[]=${slug}@${weights}`;
    })
    .join("&");
  return `https://api.fontshare.com/v2/css?${params}&display=swap`;
}

/** Las URLs de hoja de estilos que necesita una pareja (una por proveedor implicado). */
export function getFontPairHrefs(pair: FontPair): readonly string[] {
  const faces = [pair.displayFont, pair.bodyFont];
  return [googleFontsHref(faces), fontshareHref(faces)].filter(
    (href): href is string => href !== null,
  );
}

/**
 * Inyecta en `<head>` solo los `<link>` de `pair` y retira los de cualquier
 * pareja anterior. Idempotente. No-op sin `document` (servidor).
 */
export function applyFontPair(pair: FontPair, doc?: Document): void {
  const target = doc ?? (typeof document !== "undefined" ? document : undefined);
  if (!target) return;

  const wanted = new Set(getFontPairHrefs(pair));

  for (const link of Array.from(target.querySelectorAll(`link[${MANAGED_LINK_ATTR}]`))) {
    const href = link.getAttribute("href");
    if (href !== null && wanted.has(href)) {
      wanted.delete(href); // ya está cargado, no volver a añadirlo
    } else {
      link.remove(); // sobra: era de otra pareja
    }
  }

  for (const href of wanted) {
    const link = target.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(MANAGED_LINK_ATTR, pair.id);
    target.head.appendChild(link);
  }
}
