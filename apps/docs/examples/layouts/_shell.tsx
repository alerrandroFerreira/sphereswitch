// Envoltorio común de los ejemplos de layout. Cada variante lo usa para no
// repetir el andamiaje y para que todas reaccionen a las variables CSS de
// SphereSwitch (--color-*, --font-*).

import type { CSSProperties, ReactNode } from "react";

const base: CSSProperties = {
  background: "var(--color-bg, #fff)",
  color: "var(--color-fg, #111)",
  fontFamily: "var(--font-body, system-ui, sans-serif)",
  border: "2px solid var(--color-border, #ddd)",
  borderRadius: 12,
  padding: 24,
  minHeight: 200,
};

export function ExampleShell({
  title,
  children,
  style,
}: {
  title: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section style={{ ...base, ...style }}>
      <h2 style={{ fontFamily: "var(--font-display, inherit)", margin: "0 0 12px" }}>{title}</h2>
      {children}
    </section>
  );
}
