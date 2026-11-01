# Frente B — laboratorio cuadrático

Asignación aceptada: `docs/handoffs/labs-b-next-quadratic.md`.
Responsable: PC con funciones y api_reverse.
Rama: `codex/labs-quadratic-b`.
Base: `d56f5e0` de origin/main, con el laboratorio lineal integrado.
Estado: listo para revisión e integración por A; sin fusión a main.

## Alcance

Crear `QuadraticLab.tsx`, `quadratic-lab.css`, `packages/math-labs/quadratic.ts` y pruebas `tests/labs/quadratic*.test.*`. Sin props, servicios, persistencia ni dependencias nuevas. Parámetros acotados, gráfica, tabla, descripción, controles nativos y restauración. a=0 es constante, sin vértice único ni eje exclusivo. No editar el laboratorio lineal, muestreador, rutas de integración ni archivos de A.

## Implementación

Export nombrado `QuadraticLab`, sin props, en `apps/web/src/labs/QuadraticLab.tsx`; importa CSS propio con clases `zenit-lab-quadratic-`. a está entre −3 y 3; h y k entre −4 y 4, pasos de 0,5. Estado React local; sin login, llamadas de red ni avance. Tabla en h−2, h−1, h, h+1, h+2. Ventana SVG [−6,6]² distinta del dominio real. Vértice y eje se muestran solo cuando a≠0. Para a=0 el rango es {k}, h no modifica la gráfica y se explica que no hay vértice único ni eje exclusivo.

Matemática nueva y pura en `packages/math-labs/quadratic.ts`: evaluación finita y características de rango/vértice/eje. El caso constante evita el desbordamiento artificial de 0 por infinito con entradas finitas lejanas. Valores no finitos devuelven NaN o null según la función. Se reutiliza el muestreador existente por import sin modificarlo; no hay interpretación de expresiones ni eval.

Los estilos usan un div de cabecera para evitar heredar las reglas globales para header. Botón, sliders y caja raíz tienen estilos propios. Ningún archivo del lineal, del muestreador o del frente A cambió.

## Validación ejecutada

- `npm run check`: aprobado, TypeScript, 148 pruebas en 8 archivos (12 nuevas) y build principal.
- Bundle aislado con dos instancias: aprobado, 18 módulos. Harness temporal en `.local-sources/quadratic-qa/`; bundle en `.local-sources/quadratic-dist/`, fuera de Git.
- QA Chromium headless con Playwright ya instalado en la fuente local `funciones`: aprobado. Verificados Inicio/Fin/flecha, signo negativo, traslaciones, simetría de tabla, rango, a=0 sin marcador/eje, invariancia de la gráfica constante al cambiar h, restauración, IDs únicos y estado independiente entre dos instancias.
- Móvil 360 px: sin desbordamiento horizontal, también tras inyectar el CSS global actual. Cero errores JavaScript. Capturas de escritorio y móvil revisadas visualmente; conservadas solo en `.local-sources/quadratic-*.png`. Un primer intento del harness falló por una ruta ESM Windows sin file URL; corregido y repetido con éxito.
- `git diff --check`: sin errores.

No se reinstalaron dependencias: se reutilizó el npm ci completado en esta PC para el laboratorio lineal; package.json y lockfile permanecen sin cambios. QA aislado con CSS global, sin nueva ruta productiva ni lector de pantalla; no implica certificación completa de accesibilidad. El muestreador no detecta discontinuidades arbitrarias entre muestras; esta familia polinómica es continua en todo ℝ.

## Reproducir vista aislada

Crear un harness HTML/TSX temporal fuera de las rutas de producción, con imports relativos a `QuadraticLab` y dos instancias, sin añadirlo al entrypoint. En esta PC se usó `.local-sources/quadratic-qa/qa.tsx`:

```tsx
import { createRoot } from 'react-dom/client';
import { QuadraticLab } from '../../apps/web/src/labs/QuadraticLab';
createRoot(document.getElementById('root')!).render(<><QuadraticLab /><QuadraticLab /></>);
```

El HTML tiene lang=es, viewport, `<div id="root"></div>` y `<script type="module" src="/qa.tsx"></script>`. Desde la raíz:

```sh
node --input-type=module -e "import {build} from 'vite'; await build({configFile:false,root:'.local-sources/quadratic-qa',build:{outDir:'../quadratic-dist',emptyOutDir:true}});"
node --input-type=module -e "import {preview} from 'vite'; await preview({configFile:false,root:'.local-sources/quadratic-qa',build:{outDir:'../quadratic-dist'},preview:{host:'127.0.0.1',port:4180,strictPort:true}});"
```

Abrir localhost:4180 y repetir los escenarios anteriores. No se depende del harness para compilar o renderizar el componente entregado.

## Relevo para A

Importar `{ QuadraticLab }` desde `./labs/QuadraticLab` y renderizar `<QuadraticLab />` donde A decida después de revisar la rama. No requiere props, proveedores, migraciones, permisos ni nuevas dependencias. A conserva rutas y navegación. Probar nuevamente en el contenedor real y, antes de una publicación, revisar matemáticas y accesibilidad con el equipo.
