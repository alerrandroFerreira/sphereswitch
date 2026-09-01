import { ExampleShell } from "./_shell";

export default function BackMarketLayout() {
  return (
    <ExampleShell title="Back Market">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            background: "var(--color-accent, #999)",
            color: "#fff",
            padding: 16,
            borderRadius: 8,
          }}
        >
          Bloque de color plano, mensaje directo.
        </div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Precio grande</li>
          <li>Sello de confianza</li>
          <li>CTA verde</li>
        </ul>
      </div>
    </ExampleShell>
  );
}
