# Coordinación entre máquinas y colaboradores

Cada máquina dispone de fuentes distintas. Git comparte el código adaptado, las decisiones, los contratos y las evidencias resumidas. La existencia de un recurso en una máquina no implica que esté disponible en las demás.

## Inicio de trabajo

1. Ejecutar `git status --short`. Con cambios propios pendientes, guardarlos en un commit de trabajo antes de integrar cambios ajenos.
2. Ejecutar `git fetch origin`, revisar los cambios y actualizar la rama base con `git pull --ff-only origin main` desde main limpia. Si diverge, revisar e integrar en una rama propia; no usar reset destructivo ni force push.
3. Leer el plan maestro de la raíz, `docs/construction-plan.md`, `docs/backlog.md` y las entregas recientes en `docs/handoffs/`.
4. Crear una rama `codex/<tarea>-<identificador>`. Registrar responsable, alcance, recursos disponibles, archivos previstos y dependencias en una entrega propia; publicar pronto esa rama para hacer visible el trabajo en curso. El registro informa, pero no constituye un bloqueo distribuido: coordinar expresamente cuando dos personas cambien los mismos archivos.

## Durante la implementación

- Mantener Clerk, D1, Mercado Pago Orders, SKU y precio vigentes según el plan de construcción. Los cambios de contratos o migraciones deben explicarse y coordinarse antes de que otros los consuman.
- Usar rutas configurables. No depender de la letra de unidad, usuario de Windows, cachés ni carpetas temporales de otra máquina.
- Cada máquina adapta sus fuentes localmente y aporta cambios pequeños, revisables y con procedencia. Registrar recursos faltantes como pendientes; continuar con tareas independientes.
- Los secretos se configuran por máquina mediante los mecanismos seguros del proyecto. No trasladar `.env.local`, sesiones, bases reales, `node_modules`, compilados ni bibliotecas de terceros completas mediante Git.
- Los bancos externos empiezan como borradores con procedencia, permisos y revisión matemática pendientes. No publicar claves ni contenidos premium en el cliente.

## Cierre y relevo

1. Actualizar la entrega propia con qué cambió, qué se verificó realmente, qué falta, contratos modificados y siguiente tarea concreta. Una entrega por tarea evita que todos editen una sola bitácora.
2. Ejecutar las comprobaciones pertinentes. Para cambios de la aplicación: `npm ci` y `npm run check`; agregar QA de las rutas afectadas cuando corresponda. Separar resultados históricos de los ejecutados en esta máquina.
3. Revisar `git diff --check`, el diff y la lista de archivos preparados. Hacer commit de los archivos concretos de la tarea.
4. Ejecutar `git fetch origin`, integrar los cambios necesarios en la rama propia y repetir las comprobaciones si cambia la implementación. Publicar con `git push -u origin <rama>`.
5. Compartir rama y hash resultantes. Incorporar a main mediante la revisión del equipo. Main tiene despliegue automático: no utilizarla como canal de trabajo incompleto.

El hash final se informa en el mensaje de entrega o en la revisión; no escribir en un commit su propio hash. Si falla pull, push o alguna prueba, registrar el fallo y el estado local sin afirmar que se compartió.

## Plantilla de entrega

Copiar a `docs/handoffs/AAAA-MM-DD-tarea-identificador.md`:

```md
# Tarea y fecha
Responsable / máquina: identificador sin datos personales innecesarios
Rama: codex/...
Estado: en curso | listo para revisión | integrado | pendiente de dependencia
Base: hash de origen usado

## Recursos locales
Disponibles, faltantes y procedimiento para ubicarlos en otra máquina.

## Cambios y decisiones
Archivos, comportamiento y contratos afectados; procedencia del material adaptado.

## Validación
Comandos, resultados reales y límites de lo comprobado.

## Próximo paso
Tarea concreta, dependencia y criterios de aceptación.
```

## Inventario de fuentes de cada PC

`python scripts/inventory-local-sources.py --sources-root "C:\ruta\a\carpeta-con-fuentes"`

Busca las carpetas hermanas `funciones` y `api_reverse`. Sin argumento utiliza `Music` dentro del directorio del usuario. Genera `.local-sources/summary.json` y `.local-sources/pdf-inventory.json`, excluidos de Git. Lee CSV y calcula SHA-256 de PDF sin ejecutar descargadores ni consultar sitios externos. Compartir en la entrega únicamente el resumen pertinente; los manifiestos detallados se conservan localmente para comparar recursos cuando se transfieran.

## Distribución vigente
Leer [asignación entre laptops](work-assignments.md) antes de crear tareas. Define los frentes A/B, rutas reservadas y el contrato inicial de FunctionsLab.
