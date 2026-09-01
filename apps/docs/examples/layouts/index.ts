// Los 10 layouts originales, como ejemplo de demo dentro del sitio de docs —
// nunca como parte del paquete publicado de @sphereswitch/react. Quien instala
// el paquete no descarga ni un byte de estos diseños salvo que copie este
// código. Cada uno se carga perezosamente: React.lazy + LayoutSwitch hacen que
// solo la variante activa pese en el bundle de cliente.
//
// El desarrollo real de estas páginas (Fumadocs, demo interactiva) es del
// Goal 20; aquí solo se registra el mecanismo con los 10 ids trasladados.

import { lazy } from "react";
import type { LayoutVariant } from "@sphereswitch/react";

export const EXAMPLE_LAYOUT_VARIANTS: readonly LayoutVariant[] = [
  {
    id: "apple",
    name: "Apple",
    description: "Titular enorme y centrado, mucho aire, una sola idea por pantalla.",
    component: lazy(() => import("./apple")),
  },
  {
    id: "back-market",
    name: "Back Market",
    description: "Bloques de color plano, precio y CTA por delante.",
    component: lazy(() => import("./back-market")),
  },
  {
    id: "parallax-cinematic",
    name: "Parallax cinematográfico",
    description: "Capas que se desplazan a distinta velocidad al hacer scroll.",
    component: lazy(() => import("./parallax-cinematic")),
  },
  {
    id: "brutalist-editorial",
    name: "Brutalista editorial",
    description: "Rejilla visible, tipografía cruda, contraste máximo.",
    component: lazy(() => import("./brutalist-editorial")),
  },
  {
    id: "modern-saas",
    name: "SaaS moderno",
    description: "Frase de valor, dos CTA, capturas de producto con sombra suave.",
    component: lazy(() => import("./modern-saas")),
  },
  {
    id: "editorial-magazine",
    name: "Editorial revista",
    description: "Columnas de lectura, capitulares, imágenes a sangre.",
    component: lazy(() => import("./editorial-magazine")),
  },
  {
    id: "bento-grid",
    name: "Bento grid",
    description: "Rejilla de bloques de distinto tamaño, estilo panel de control.",
    component: lazy(() => import("./bento-grid")),
  },
  {
    id: "scroll-driven-agency",
    name: "Agencia scroll-driven",
    description: "Escenas a pantalla completa que se revelan con el scroll.",
    component: lazy(() => import("./scroll-driven-agency")),
  },
  {
    id: "corporate-trust",
    name: "Corporativo de confianza",
    description: "Cifras, certificaciones y paleta conservadora por delante.",
    component: lazy(() => import("./corporate-trust")),
  },
  {
    id: "artisanal-scrapbook",
    name: "Artesanal / scrapbook",
    description: "Texturas de papel y elementos rotados, sensación hecha a mano.",
    component: lazy(() => import("./artisanal-scrapbook")),
  },
];
