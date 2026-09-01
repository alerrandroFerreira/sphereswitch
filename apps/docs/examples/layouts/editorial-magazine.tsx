import { ExampleShell } from "./_shell";

export default function EditorialMagazineLayout() {
  return (
    <ExampleShell title="Editorial revista">
      <div style={{ columnCount: 2, columnGap: 24 }}>
        <p style={{ fontFamily: "var(--font-display, serif)", fontSize: 24 }}>
          Titular a dos columnas, con capitular.
        </p>
        <p style={{ opacity: 0.75 }}>
          Cuerpo de texto largo, márgenes generosos, imágenes a sangre entre bloques de lectura.
        </p>
      </div>
    </ExampleShell>
  );
}
