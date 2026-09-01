import { ExampleShell } from "./_shell";

export default function BrutalistEditorialLayout() {
  return (
    <ExampleShell
      title="Brutalista editorial"
      style={{ borderWidth: 4, borderRadius: 0, fontFamily: "var(--font-display, monospace)" }}
    >
      <p style={{ textTransform: "uppercase", letterSpacing: 1 }}>
        Rejilla visible. Tipografía cruda. Sin sombras ni degradados.
      </p>
      <hr style={{ borderColor: "var(--color-fg)" }} />
      <p>Columnas anchas, numeración a la vista, contraste máximo.</p>
    </ExampleShell>
  );
}
