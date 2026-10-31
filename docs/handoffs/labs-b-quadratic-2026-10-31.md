# Frente B — laboratorio cuadrático

Asignación aceptada: `docs/handoffs/labs-b-next-quadratic.md`.
Responsable: PC con funciones y api_reverse.
Rama: `codex/labs-quadratic-b`.
Base: `d56f5e0` de origin/main, con el laboratorio lineal integrado.
Estado: en curso.

## Alcance

Crear `QuadraticLab.tsx`, `quadratic-lab.css`, `packages/math-labs/quadratic.ts` y pruebas `tests/labs/quadratic*.test.*`. Sin props, servicios, persistencia ni dependencias nuevas. Parámetros acotados, gráfica, tabla, descripción, controles nativos y restauración. a=0 es constante, sin vértice único ni eje exclusivo. No editar el laboratorio lineal, muestreador, rutas de integración ni archivos de A.

## Validación prevista

`npm run check`, build y QA aislados con evidencia real de teclado, dos instancias y móvil. Las utilidades probarán signos, cero, simetría, traslaciones y no finitos. La conexión al aula será revisada y realizada por A.
