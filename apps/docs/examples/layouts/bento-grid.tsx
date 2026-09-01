import { ExampleShell } from "./_shell";

export default function BentoGridLayout() {
  const cell = { background: "var(--color-accent, #eee)", borderRadius: 8, padding: 12 };
  return (
    <ExampleShell title="Bento grid">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gridTemplateRows: "auto auto",
          gap: 8,
        }}
      >
        <div style={{ ...cell, gridRow: "span 2" }}>Bloque grande</div>
        <div style={cell}>Métrica</div>
        <div style={cell}>Métrica</div>
        <div style={cell}>Cita</div>
        <div style={cell}>Logo</div>
      </div>
    </ExampleShell>
  );
}
