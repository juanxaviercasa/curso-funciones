# Frente B — exploraciones preuniversitarias

Asignación aceptada: `docs/handoffs/labs-b-next-preuniversitario.md`, leída en `origin/codex/private-media-a`, commit `b2f09df`. No estaba aún en main; no se incorpora código de esa rama.
Base: `0e30c302912570fccbe5aed7880ce0f51c307ae2` de origin/main.
Rama: `codex/labs-preuniversitario-b`.
Estado: listo para revisión del frente A; sin integración a main.

## Reserva

`apps/web/src/labs/FamilyExplorerLab.tsx`, `TrigonometryLab.tsx`, componentes internos/CSS propios; matemática pura nueva en `packages/math-labs/`; pruebas en `tests/labs/`; inventario en `docs/sources/pc-b/`; esta entrega. No modificar laboratorios previos, muestreador existente, rutas, backend, DB, configuración raíz ni dependencias. A integra navegación.

Familias: afín, cuadrática, absoluto, raíz, recíproca, exponencial y logarítmica. Trigonometría: seno, coseno y tangente. Transformación a f(b(x−h))+k, comparación con base, metadatos y actividades originales gratuitas, sin persistencia. Validar ceros, dominios originales y polos antes de dibujar. Si surge un límite matemático o técnico se documentará explícitamente.

## Entrega y contrato

- `FamilyExplorerLab` y `TrigonometryLab`: exports nombrados, sin props. Ambos usan `ExplorationPanel` interno y CSS con clases `zenit-lab-explore-`. Sin proveedores, rutas nuevas, login, red, almacenamiento ni dependencias nuevas.
- Selector de familias; base 2, 3 o 0,5 para exponencial/logaritmo. Parámetros a,b,h,k acotados; h trigonométrico en pasos enteros convertidos a π/4 para que Inicio/Fin alcancen ±π. Comparación azul discontinua f(x) / naranja continua g(x), tabla de ambas a igual x, descripción SVG y datos textuales.
- Dominio, rango, cortes, simetría, monotonía y asíntotas calculados. Trigonometría en radianes con marcas de π, período y amplitud; amplitud no aplicable a tangente. Las reglas distinguen a=0 y b=0: no se cancelan exclusiones, y b=0 en log/recíproca produce dominio vacío.
- Segmentación nueva con claves analíticas de rama: la recíproca y tangente se separan incluso si ningún punto coincide exactamente con el polo. Raíz incluye su frontera cerrada; log excluye argumento no positivo. Círculos abiertos señalan huecos al anular a; no se anuncian asíntotas verticales para esas constantes restringidas.
- Dos actividades originales por laboratorio: predicción obligatoria antes de cargar el escenario, contraste y justificación escrita. Sin calificación automática. El mensaje de cada actividad avisa cuando la gráfica cambió después de cargarla; así no se interpreta una explicación previa como evidencia de la gráfica actual.
- Inventario de código y muestra de libros en `docs/sources/pc-b/preuniversitario.md`; herramienta reproducible `scripts/source-b/inventory-preuniversity.py`. Se conserva el inventario histórico de los 199 PDF; no se duplican libros ni imágenes en Git.

## Validación en esta PC

- `npm run check`: TypeScript, 217 pruebas en 13 archivos y build principal aprobados (41 pruebas nuevas). Se conservó el lockfile y la instalación npm ci ya existente; no se añadieron paquetes.
- Build aislado con cuatro instancias (dos de cada componente): 22 módulos, CSS y JS compilados. Necesario porque A todavía no importa los nuevos labs desde el entrypoint principal.
- `scripts/source-b/check-preuniversity.mjs`: QA Chromium headless aprobado con Playwright ya instalado en `funciones`. Recorre las 7 familias y 3 trigonométricas, ceros de a/b, base 0,5, tabla, dominios vacíos, las cuatro actividades, restauración, teclado y cuatro instancias sin IDs repetidos ni estado compartido. Cero errores JS.
- Móvil 360 px sin desbordamiento, también con el CSS global actual inyectado. Capturas reales desktop/móvil revisadas visualmente, en `.local-sources/preuni-*.png`, fuera de Git.
- Pruebas puras verifican signos y traslaciones, restricciones con a=0, b=0, bases inválidas, log≤0, frontera de raíz, polos trasladados de tangente, amplitud/período, rango no limitado por ventana y segmentación sin puentes entre polos.
- Inventario PDF ejecutado con pypdf del runtime: 410/426/370 páginas físicas para los textos de 3.º/4.º/5.º. Revisión visual por Poppler de páginas 1–6, 78 y 100 del texto de 5.º; autor y editorial visibles registrados como evidencia local, permisos pendientes. Se detectó notación de rango que requiere revisión; no se importó.
- `git diff --check`: sin errores. Solo rutas de B; sin cambios en componentes previos, muestreador existente, configuración, estilos globales, backend, DB, identidad o pagos.

Incidencias resueltas: las primeras expectativas de prueba asumían coma decimal, pero es-PE usa punto en este runtime; se validan ambos formatos sin alterar las matemáticas. El slider de radianes con min/step de π truncaba Fin a 3π/4; se sustituyó por pasos enteros −4..4 convertidos a radianes y se repitió QA. Se evita mostrar valores exponenciales pequeños como 0: se usa notación científica para no sugerir que alcanzan su asíntota.

## Reproducir vista y QA

Crear `.local-sources/preuni-qa/index.html` con lang=es, meta viewport, `<div id="root"></div>` y `<script type="module" src="/qa.tsx"></script>`. El harness temporal `qa.tsx`:

```tsx
import { createRoot } from 'react-dom/client';
import { FamilyExplorerLab } from '../../apps/web/src/labs/FamilyExplorerLab';
import { TrigonometryLab } from '../../apps/web/src/labs/TrigonometryLab';
createRoot(document.getElementById('root')!).render(<><FamilyExplorerLab /><FamilyExplorerLab /><TrigonometryLab /><TrigonometryLab /></>);
```

Desde la raíz:

```sh
node --input-type=module -e "import {build} from 'vite'; await build({configFile:false,root:'.local-sources/preuni-qa',build:{outDir:'../preuni-dist',emptyOutDir:true}});"
node --input-type=module -e "import {preview} from 'vite'; await preview({configFile:false,root:'.local-sources/preuni-qa',build:{outDir:'../preuni-dist'},preview:{host:'127.0.0.1',port:4184,strictPort:true}});"
node scripts/source-b/check-preuniversity.mjs C:/ruta/a/playwright/index.mjs http://127.0.0.1:4184/
```

El script requiere una instalación existente de Playwright y Chromium; no es dependencia de ejecución del producto. El harness y capturas son locales; los módulos entregados compilan sin esos archivos.

## Límites y relevo

A debe revisar e importar `{ FamilyExplorerLab }` desde `./labs/FamilyExplorerLab` y `{ TrigonometryLab }` desde `./labs/TrigonometryLab`; no se conectaron rutas ni se fusionó main. Repetir QA en contenedor real. Sin lector de pantalla ni certificación completa de accesibilidad; revisión matemática docente adicional pendiente. No se afirma alineación oficial con universidades.

Las características son reglas específicas de estas familias y parámetros, no un CAS general. Resultados numéricos aproximados (hasta 3 decimales o 3 cifras en notación científica); polos trigonométricos se reconocen con tolerancia |cos(u)|≤10⁻¹². Ventana finita y muestreo acotado no representan todos los puntos de una función. Números extremos no representables devuelven null; la UI acota parámetros. La monotonía de seno/coseno se describe por el signo de su derivada por tramos, no como una única monotonía global.

Inversas, composición, funciones por tramos y contrato de retos premium quedan para las **siguientes entregas separadas** indicadas por A. No se han comenzado ni se anuncian como terminados. Los PDF quedan fuera del producto hasta resolver permisos y revisión. Esta entrega completa los dos laboratorios y las cuatro actividades del alcance inmediato.
