# Frente B — dominio y rango de raíz cuadrada

Asignación aceptada: `docs/handoffs/labs-b-next-domain.md`.
Responsable: PC con funciones y api_reverse.
Rama: `codex/labs-domain-b`.
Base: `3008aa0` de origin/main, con QuadraticLab integrado.
Estado: en curso.

## Alcance reservado

Crear `apps/web/src/labs/RootDomainLab.tsx`, CSS propio `zenit-lab-root-domain-`, `packages/math-labs/root-domain.ts`, pruebas `tests/labs/root-domain*` y esta entrega. Sin modificar componentes anteriores, muestreador, rutas o archivos del frente A. Sin servicios externos, dependencias nuevas, persistencia ni claves premium.

Explorar a√(x−h)+k con dominio [h,+∞) aun si a=0; extremo (h,k), rango según el signo de a, tabla con entradas válidas e inválidas, SVG descriptivo, controles de teclado y restauración.

## Validación prevista

Pruebas de frontera, fuera de dominio, signo/cero, traslaciones, no finitos y ventana visible. `npm run check`, bundle aislado con dos instancias y QA Chromium/móvil de 360 px con evidencia real. A conserva integración y navegación.
