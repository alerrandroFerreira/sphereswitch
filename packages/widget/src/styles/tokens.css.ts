// Tokens fijos de marca (sección 2.5 del documento de especificación).
// No son personalizables por quien instala el paquete: es la firma visual de
// SphereSwitch, igual que la barra de herramientas de un devtool no se
// restylea. Todo vive dentro del scope `.sphereswitch-root`.
//
// Contenido como plantilla de texto (no un archivo .css importado) para no
// necesitar un loader de CSS en el build — ver ./inject.ts.

export const TOKENS_CSS = `
.sphereswitch-root {
  /* Fondo: gris elegante con tinte azul tecnológico, familia fría. */
  --ss-bg: #14171c;
  --ss-bg-elevated: #1b1f26;
  --ss-fg: #e7eaf0;
  --ss-fg-muted: #8b93a3;
  --ss-border: #2a2f3a;

  /* Sin acento fijo: el único color vivo de la interfaz es el propio orbe. */
  --ss-radius: 10px;
  --ss-radius-sm: 6px;
  --ss-border-width: 1.5px;

  /* Tipografía mixta: display con carácter para títulos, mono técnica para datos. */
  --ss-font-display: "Space Grotesk", system-ui, -apple-system, sans-serif;
  --ss-font-body: "Inter", system-ui, -apple-system, sans-serif;
  --ss-font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;

  /* Animación rápida, sin rebote: easing directo. */
  --ss-duration: 140ms;
  --ss-ease: cubic-bezier(0.2, 0, 0, 1);

  --ss-shadow: 0 8px 30px rgb(0 0 0 / 0.35);
  color-scheme: dark;
}

@media (prefers-reduced-motion: reduce) {
  .sphereswitch-root {
    --ss-duration: 0ms;
  }
}
`;
