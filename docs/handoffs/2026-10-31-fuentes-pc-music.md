# Revisión de fuentes locales — 31 octubre 2026

Máquina: PC Windows con fuentes en Music.
Rama de entrega: codex/local-sources-handoff.
Base revisada: `0431845fdd45537adc54a5fa62fc84d6cfbac55a`.
Estado: revisión e inventario; adaptación funcional de laboratorios pendiente.
Base del proyecto: arquitectura React/Vite + Worker/D1 + Clerk + Mercado Pago Orders.

## Recursos y hallazgos

| Fuente | Evidencia local | Uso propuesto |
|---|---|---|
| `funciones/src/math.ts` | Evaluación de cinco familias, muestreo acotado y tratamiento de discontinuidades por segmentos | Extraer utilidades puras con pruebas matemáticas antes de conectar un laboratorio |
| `funciones/src/screens/Lab.tsx`, `src/components/InteractiveGraph.tsx` | Laboratorio React con controles, máquina de funciones y dependencias de fórmulas/preferencias | Adaptar por componentes, comenzando con una muestra gratuita aislada |
| `funciones/src/exercises.ts`, `src/adaptive.ts`, `src/learning.ts` | Plantillas, respuestas, pistas y progresión del proyecto de origen | Revisar contenido; llevar claves y corrección premium al servidor; mapear intentos al contrato actual |
| `funciones/src/sync/`, `supabase/` | Autenticación/sincronización de otra arquitectura | Usar como referencia de conflictos; conservar Clerk/D1 y progreso validado en servidor |
| `api_reverse/catalogo_apps_interactivas*.csv` | Catálogos separados de primaria y secundaria con metadatos y URLs | Índice de candidatos; las URLs no acreditan disponibilidad, código local ni derechos |
| `api_reverse/apps_full_secundaria.json`, `libros_secundaria.json` | Respuestas guardadas y catálogo de libros | Conservar procedencia; no confundir entradas de catálogo con libros descargados |
| `api_reverse/libros_descargados/` | 199 archivos con extensión PDF en esta PC | Inventario offline por ruta, tamaño, firma y SHA-256; borradores, sin publicación |

Los 1108 PDF y el dataset de preguntas citados en el plan no se han verificado como disponibles aquí. Quien tenga esos recursos deberá aportar su propio inventario. Comparar hashes entre máquinas permite detectar duplicados binarios; un hash distinto no demuestra un título distinto.

## Portabilidad

Node v24.18.0, npm 11.16.0 y Python 3.12.10 detectados. El clon no tenía `node_modules` al comenzar. No se ejecutaron las pruebas de la aplicación ni se verificaron credenciales, bases remotas o cuentas desde esta PC.

`generar_csv_apps.py` depende de `AppData/Local/Temp/opencode/apps_full.json`. `descargar_todos_los_libros.py` referencia allí `libros.json`, `LibrosArcad.json`, `LibrosGuias.json` y `LibrosGuiasProf.json`. No están incluidos en la carpeta `api_reverse` revisada; falta comprobar si sobreviven fuera de ella o recuperarlos de la otra laptop. Los scripts de secundaria usan rutas relativas a su archivo, pero ejecutan peticiones externas. No se ejecutaron extractores ni descargadores.

No trasladar `node_modules`, `dist`, cachés ni `.env.local` de `funciones`. Revisar autoría y licencias de los fragmentos seleccionados y dependencias antes de distribuirlos. El laboratorio depende de componentes, preferencias, fórmulas e iconos; copiar solo su pantalla no constituye una integración funcional.

## Cambios de esta entrega

- Script offline parametrizable `scripts/inventory-local-sources.py`, sin dependencias Python externas.
- Resultados locales excluidos mediante `.gitignore`.
- Flujo de coordinación en `docs/team-workflow.md` y enlace desde el plan y README.
- Ningún cambio de runtime, esquema, autenticación, compra o contenido publicado.

## Validación ejecutada en esta PC

`python scripts/inventory-local-sources.py` completado: 199 PDF, 199 hashes únicos, 13.704.044.429 bytes y ninguna cabecera PDF inválida. Categorías: Alumnos 78, Docentes 60, GuiasProfesor 6, Secundaria 55. La carpeta Guias existe pero no aportó PDF al recorrido. Esto no certifica integridad completa ni número de títulos.

Catálogo de primaria: 5503 filas y 2937 ID únicos. Secundaria: 4118 filas y 2604 ID únicos. Hay ID repetidos dentro de cada catálogo: revisar sus asociaciones a grados/lecciones antes de deduplicar; usar como mínimo nivel + ID para separar fuentes. No se verificó disponibilidad de las URLs. El manifiesto y el resumen quedan en `.local-sources/`, fuera de Git.

`git diff --check` sin errores tras los cambios iniciales. No se ejecutó `npm run check`: esta entrega modifica documentación y una utilidad offline, sin cambios de aplicación.

## Próximas implementaciones

1. PC con `funciones`: portar matemática pura y una gráfica de muestra. Verificar raíz fuera de dominio, parámetro b=0, valores no finitos, límites de muestreo y navegación por teclado. Mantener la muestra separada de progreso y derechos de compra.
2. Máquina con bancos originales: entregar manifiesto con identificador de fuente, ruta relativa, hash, permisos y estado de revisión. Comparar con el inventario local antes de copiar archivos o importar registros.
3. Acordar formato de borrador antes de implementar el importador: ID estable con espacio de nombres de fuente, procedencia, tema, enunciado, tipo, clave opcional, explicación, permisos y revisión matemática. Claves incompletas permanecen sin autocorrección.
4. Implementar importación administrativa privada en una tarea separada, con migración revisada, validación, deduplicación y auditoría. La etapa actual del editor solo modifica textos publicados; no ofrece aún borradores de preguntas.

Aceptación: cada contribución se puede reproducir después de un pull sin acceder al disco de otra persona; enumera dependencias faltantes, conserva contratos existentes y aporta evidencia verificable.
