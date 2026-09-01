import { ExampleShell } from "./_shell";

export default function ScrollDrivenAgencyLayout() {
  return (
    <ExampleShell title="Agencia scroll-driven">
      <p>Secciones a pantalla completa que se revelan y transforman al hacer scroll.</p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {["01", "02", "03"].map((n) => (
          <div
            key={n}
            style={{
              flex: 1,
              border: "1px dashed var(--color-border)",
              borderRadius: 8,
              padding: 12,
              opacity: n === "01" ? 1 : 0.4,
            }}
          >
            Escena {n}
          </div>
        ))}
      </div>
    </ExampleShell>
  );
}
