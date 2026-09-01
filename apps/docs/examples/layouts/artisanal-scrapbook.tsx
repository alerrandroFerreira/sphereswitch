import { ExampleShell } from "./_shell";

export default function ArtisanalScrapbookLayout() {
  return (
    <ExampleShell
      title="Artesanal / scrapbook"
      style={{ fontFamily: "var(--font-display, cursive)" }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            transform: "rotate(-2deg)",
            border: "1px solid var(--color-border)",
            padding: 8,
            display: "inline-block",
          }}
        >
          Nota pegada
        </div>
        <div
          style={{
            transform: "rotate(3deg)",
            border: "1px solid var(--color-border)",
            padding: 8,
            display: "inline-block",
            marginLeft: 12,
          }}
        >
          Polaroid
        </div>
      </div>
      <p style={{ marginTop: 12 }}>
        Texturas de papel, elementos ligeramente rotados, sensación hecha a mano.
      </p>
    </ExampleShell>
  );
}
