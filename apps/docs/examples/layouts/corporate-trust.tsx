import { ExampleShell } from "./_shell";

export default function CorporateTrustLayout() {
  return (
    <ExampleShell title="Corporativo de confianza" style={{ borderColor: "var(--color-accent)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          textAlign: "center",
        }}
      >
        <div>+15 años</div>
        <div>ISO certificado</div>
        <div>Soporte 24/7</div>
      </div>
      <p style={{ opacity: 0.7, marginTop: 12 }}>
        Paleta conservadora, tipografía neutra, cifras y sellos por delante.
      </p>
    </ExampleShell>
  );
}
