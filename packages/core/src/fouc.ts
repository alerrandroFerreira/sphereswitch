// Generador del script anti-FOUC. La primitiva vive aquí; cómo se inyecta el
// string resultante en Next.js, Vite, Astro, etc. es responsabilidad de cada
// adaptador, no del núcleo.

import { DEFAULT_ATTRIBUTE_PREFIX, DEFAULT_STORAGE_KEY_PREFIX } from "./types";
import type { SphereSwitchConfig } from "./types";

/**
 * Devuelve un fragmento de JavaScript vanilla, sin dependencias, listo para
 * inyectarse como `<script>` bloqueante dentro del `<head>`. Lee `localStorage`
 * y fija los atributos `data-*` en `<html>` antes de la primera pintura,
 * evitando el parpadeo de tema incorrecto (mismo patrón que `next-themes`).
 *
 * El string es seguro para incrustarse inline: los datos de configuración se
 * serializan con `JSON.stringify` y se neutraliza `<` para no poder cerrar el
 * `<script>` desde un valor.
 */
export function generateFoucScript(config: SphereSwitchConfig): string {
  const storageKeyPrefix = config.storageKeyPrefix ?? DEFAULT_STORAGE_KEY_PREFIX;
  const attributePrefix = config.attributePrefix ?? DEFAULT_ATTRIBUTE_PREFIX;
  const dimensions = config.dimensions.map((dimension) => ({
    name: dimension.name,
    values: [...dimension.values],
    defaultValue: dimension.defaultValue,
  }));

  const payload = JSON.stringify({ storageKeyPrefix, attributePrefix, dimensions }).replace(
    /</g,
    "\\u003c",
  );

  return (
    `(function(){try{` +
    `var c=${payload},e=document.documentElement,i,d,v;` +
    `for(i=0;i<c.dimensions.length;i++){` +
    `d=c.dimensions[i];v=null;` +
    `try{v=window.localStorage.getItem(c.storageKeyPrefix+":"+d.name)}catch(_){}` +
    `if(v===null||d.values.indexOf(v)===-1){v=d.defaultValue}` +
    `e.setAttribute("data-"+c.attributePrefix+"-"+d.name,v)` +
    `}}catch(_){}})();`
  );
}
