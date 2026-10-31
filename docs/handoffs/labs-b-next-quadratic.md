# Siguiente tarea B: laboratorio cuadrático
Asignada por instrucción del propietario. Estado: pendiente de confirmación de inicio por B.
Entrega lineal recibida: 7b3e25f. A conecta /laboratorio/funciones y el enlace del aula.

## Alcance
Crear componente nombrado QuadraticLab sin props en apps/web/src/labs/QuadraticLab.tsx. Explorar f(x)=a(x-h)²+k con parámetros acotados, controles de teclado, restauración, gráfica SVG, tabla y descripción. Sin servicios externos, progreso, claves premium o dependencias nuevas.
Si a=0 es constante: no mostrar vértice único ni eje de simetría exclusivo de parábola. Dominio real; rango [k,+∞) para a>0, (-∞,k] para a<0, {k} para a=0. Ventana visible no equivale al dominio.

## Rutas reservadas
- Componente nuevo y quadratic-lab.css con clases zenit-lab-quadratic-.
- packages/math-labs/quadratic.ts con matemática pura e import directo.
- tests/labs/quadratic.test.ts y quadratic-lab.test.tsx.
- docs/handoffs/labs-b-quadratic-*.md.
No modificar FunctionsLab, functions-lab.css, muestreador genérico, main.tsx, classroom.tsx, style.css, backend, migraciones, autenticación, pagos ni package.json.

## Coordinación
Fetch y crear codex/labs-quadratic-b desde origin/main si incluye 7b3e25f; si aún no, desde origin/codex/labs-functions-b. Declarar base exacta. Subir primero entrega de inicio. No incorporar codex/platform-admin-a ni fusionar a main. A integra rutas después de revisión.

## Aceptación
Pruebas de cero, signos, simetría respecto a h, traslaciones y no finitos; sin eval. Dos instancias sin IDs repetidos, teclado y móvil sin desbordamiento. npm run check y QA aislado con evidencia real. No afirmar prueba no ejecutada. La muestra es gratuita y no registra avance.
