import { ExampleShell } from "./_shell";

export default function AppleLayout() {
  return (
    <ExampleShell title="Apple" style={{ textAlign: "center", padding: 48 }}>
      <p style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>Titular enorme, centrado.</p>
      <p style={{ opacity: 0.7 }}>
        Mucho aire, una sola idea por pantalla, foto de producto grande.
      </p>
    </ExampleShell>
  );
}
