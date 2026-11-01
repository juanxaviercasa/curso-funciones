# Frente B — dominio y rango de raíz cuadrada

Asignación aceptada: `docs/handoffs/labs-b-next-domain.md`.
Responsable: PC con funciones y api_reverse.
Rama: `codex/labs-domain-b`.
Base: `3008aa0` de origin/main, con QuadraticLab integrado.
Estado: listo para revisión e integración por A; sin fusión a main.

## Alcance reservado

Crear `apps/web/src/labs/RootDomainLab.tsx`, CSS propio `zenit-lab-root-domain-`, `packages/math-labs/root-domain.ts`, pruebas `tests/labs/root-domain*` y esta entrega. Sin modificar componentes anteriores, muestreador, rutas o archivos del frente A. Sin servicios externos, dependencias nuevas, persistencia ni claves premium.

Explorar a√(x−h)+k con dominio [h,+∞) aun si a=0; extremo (h,k), rango según el signo de a, tabla con entradas válidas e inválidas, SVG descriptivo, controles de teclado y restauración.

## Implementación

Componente nombrado `RootDomainLab`, sin props. Importa CSS propio con clases `zenit-lab-root-domain-`; controles a∈[−3,3], h/k∈[−4,4], pasos de 0,5, restauración y texto accesible. Estado local por instancia. SVG con título/descripción, franja de x<h, frontera y extremo lleno (h,k). Tabla en x=h−1, h, h+1, h+4, h+9; la primera fila se rotula «Sin valor real: fuera del dominio». Ningún NaN/Infinity visible.

La curva empieza exactamente en h y se muestrea hasta el borde derecho de la ventana [−6,6]², reutilizando el muestreador existente sin cambios. x<h nunca se dibuja. El dominio [h,+∞) se conserva al poner a=0; la gráfica se vuelve una semirrecta horizontal que empieza en (h,k), no una recta sobre todo ℝ. Rango: [k,+∞), (−∞,k] o {k} según a positivo, negativo o cero. El texto distingue estos conjuntos de la ventana de visualización.

`evaluateRootDomain` valida entradas finitas y dominio antes del caso constante; devuelve número finito o null cuando no hay resultado real finito representable (incluye desbordamiento numérico). `rootDomainFeatures` devuelve dominio, extremo y rango, o null para parámetros no finitos. La UI usa parámetros acotados, sin desbordamientos, y no interpreta fórmulas.

## Validación ejecutada

- `npm run check`: TypeScript y 160 pruebas en 10 archivos aprobados; build principal aprobado. 12 pruebas nuevas de esta entrega.
- Build aislado: aprobado, 18 módulos; HTML/TSX temporal con dos instancias y bundle en `.local-sources/`, fuera de Git.
- Chromium headless mediante Playwright ya disponible en `funciones/node_modules`: teclado Inicio/Fin/flecha en a/h/k, signos, h/k negativos, frontera incluida, rango y tabla, a=0 conservando dominio, desplazamiento de extremo y curva al cambiar h, dos instancias independientes sin IDs repetidos y restauración aprobados.
- Verificación de puntos SVG: ninguno a la izquierda de h ni fuera de la ventana y, para a=0, todos los puntos de la curva tienen la misma altura. La tabla conserva una entrada sin valor real y valores válidos fuera de la ventana.
- Móvil 360 px sin desbordamiento, también al inyectar el CSS global actual; cero errores JavaScript. Capturas de escritorio y móvil revisadas visualmente: `.local-sources/domain-desktop.png`, `domain-mobile.png`, `domain-mobile-global.png`.
- `git diff --check`: sin errores. Sin cambios de dependencias ni lockfile; se reutilizó la instalación npm ci existente en esta PC.

Límites: QA aislado, no recorrido de aula ni lector de pantalla; no implica certificación completa de accesibilidad. El muestreador genérico sigue sin ser detector general de discontinuidades; aquí se parte de la frontera exacta de una función continua en su dominio. Las magnitudes extremas no representables pueden devolver null, distinto de una caracterización matemática simbólica; los controles impiden ese caso al alumno.

## Reproducir la vista para integración

Crear `.local-sources/domain-qa/index.html` con lang=es, viewport, `<div id="root"></div>` y `<script type="module" src="/qa.tsx"></script>`. En la misma carpeta, usar este harness temporal:

```tsx
import { createRoot } from 'react-dom/client';
import { RootDomainLab } from '../../apps/web/src/labs/RootDomainLab';
createRoot(document.getElementById('root')!).render(<><RootDomainLab /><RootDomainLab /></>);
```

Desde la raíz del proyecto:

```sh
node --input-type=module -e "import {build} from 'vite'; await build({configFile:false,root:'.local-sources/domain-qa',build:{outDir:'../domain-dist',emptyOutDir:true}});"
node --input-type=module -e "import {preview} from 'vite'; await preview({configFile:false,root:'.local-sources/domain-qa',build:{outDir:'../domain-dist'},preview:{host:'127.0.0.1',port:4182,strictPort:true}});"
```

Abrir localhost:4182. Escenario: a=−2, h=−2, k=−1 → dominio [−2,+∞), rango (−∞,−1]; entradas −3/−2/−1/2/7 → sin valor real/−1/−3/−5/−7. Después a=0 → mismo dominio y rango {−1}; cambiar h a 4 mueve el inicio a x=4 y conserva el valor −1. La segunda instancia debe mantenerse en valores iniciales. Probar controles con teclado, restauración y 360 px. El harness no es necesario para compilar el componente ni se incluye en el entrypoint.

## Relevo para A

Importar `{ RootDomainLab }` desde `./labs/RootDomainLab` y renderizar `<RootDomainLab />` donde A decida. Sin proveedores, props, migraciones ni dependencias nuevas. Revisar la rama, conectar navegación y repetir QA en su contenedor real; no se modificaron rutas, laboratorios anteriores, estilos globales, autenticación, backend ni pagos.
