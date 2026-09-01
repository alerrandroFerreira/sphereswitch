import { defineConfig } from "@sphereswitch/core";

/**
 * Configuración de SphereSwitch.
 *
 * - Un array suelto o `{ extend: [...] }` SUMAN tus entradas al catálogo
 *   curado que viene de serie.
 * - `{ replace: [...] }` DESCARTA el catálogo curado de esa dimensión y deja
 *   únicamente tus entradas.
 *
 * Para que el autocompletado de los hooks (`usePalette()`, `useFont()`, …)
 * conozca tus ids, este archivo debe importarse en algún punto que TypeScript
 * procese y hay que conservar el bloque `declare module` de abajo.
 */
const config = defineConfig({
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

declare module "@sphereswitch/core" {
  interface SphereSwitchRegisteredConfig {
    palettes: (typeof config)["palettes"];
    fonts: (typeof config)["fonts"];
  }
}

export default config;
