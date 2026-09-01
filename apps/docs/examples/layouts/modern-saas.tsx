import { ExampleShell } from "./_shell";

export default function ModernSaasLayout() {
  return (
    <ExampleShell title="SaaS moderno">
      <p style={{ fontSize: 22, fontWeight: 600 }}>Una frase de valor.</p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          style={{
            background: "var(--color-accent, #4f46e5)",
            color: "#fff",
            border: 0,
            padding: "8px 16px",
            borderRadius: 8,
          }}
        >
          Empezar gratis
        </button>
        <button
          style={{
            background: "transparent",
            color: "var(--color-fg)",
            border: "2px solid var(--color-border)",
            padding: "8px 16px",
            borderRadius: 8,
          }}
        >
          Ver demo
        </button>
      </div>
      <p style={{ opacity: 0.6, marginTop: 12 }}>
        Logos de clientes, capturas con sombra suave, gradientes discretos.
      </p>
    </ExampleShell>
  );
}
