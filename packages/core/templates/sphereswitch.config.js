import { defineConfig } from "@sphereswitch/core";

/**
 * Configuración de SphereSwitch.
 *
 * - Un array suelto o `{ extend: [...] }` SUMAN tus entradas al catálogo
 *   curado que viene de serie.
 * - `{ replace: [...] }` DESCARTA el catálogo curado de esa dimensión y deja
 *   únicamente tus entradas.
 *
 * En JavaScript no hay autocompletado de ids en los hooks (los tipos degradan
 * a `string`); en tiempo de ejecución funciona exactamente igual que en TS.
 */
export default defineConfig({
  palettes: {
    extend: [
      {
        id: "terracota-serena",
        label: "Terracota Serena",
        reference: "Cerámica tradicional del Mediterráneo",
        colors: {
          "--color-bg": "#f4ede4",
          "--color-fg": "#2b2320",
          "--color-accent": "#c56a4a",
        },
      },
    ],
  },
  fonts: {
    extend: [
      {
        id: "editorial-sobrio",
        label: "Editorial Sobrio",
        fonts: {
          "--font-display": "'Fraunces', Georgia, serif",
          "--font-body": "'Inter', system-ui, sans-serif",
        },
      },
    ],
  },
  defaults: {
    palette: "terracota-serena",
  },
});
