# Changesets

Este directorio lo gestiona [Changesets](https://github.com/changesets/changesets).
Cada cambio con impacto en un paquete publicable lleva un archivo de changeset que
describe el tipo de versión (`patch`, `minor`, `major`) y un resumen para el changelog.

Crear uno:

```
pnpm changeset
```

El sitio de documentación (`@sphereswitch/docs`) está en `ignore` y no participa
del versionado semántico.
