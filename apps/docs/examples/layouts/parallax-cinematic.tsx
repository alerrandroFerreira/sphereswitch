import { ExampleShell } from "./_shell";

export default function ParallaxCinematicLayout() {
  return (
    <ExampleShell
      title="Parallax cinematográfico"
      style={{ background: "linear-gradient(180deg, var(--color-bg), var(--color-accent, #333))" }}
    >
      <p>Capas superpuestas que se desplazan a distinta velocidad al hacer scroll.</p>
      <p style={{ opacity: 0.7 }}>
        En el ejemplo real, cada capa es una imagen con su propio offset.
      </p>
    </ExampleShell>
  );
}
