# Fuentes locales para exploraciones preuniversitarias

Revisión del frente B, 31 octubre 2026. Rutas relativas a las carpetas `funciones` y `api_reverse` disponibles en esta PC. No son dependencias de compilación. No se copian libros, páginas, claves ni bancos privados a Git.

## Código disponible

| Archivo local | Tema/alcance comprobado | Selección y procedencia |
|---|---|---|
| funciones/src/math.ts | Familias lineal, cuadrática, absoluto, cúbica y raíz; evaluación, dominio/rango, muestreo, tangentes y fórmulas | Referencia conceptual de la aplicación del propietario. La implementación nueva reutiliza por import las utilidades ya integradas en packages/math-labs; no copia el archivo completo |
| funciones/src/screens/Lab.tsx | Parámetros y comparación de retos, máquina de funciones | Referencia de interacción; no se copian recompensas, sincronización ni respuestas |
| funciones/src/components/InteractiveGraph.tsx | SVG y controles para las familias del proyecto de origen | No se incorporan sus dependencias ni componentes completos |
| packages/math-labs/index.ts, quadratic.ts, root-domain.ts del proyecto | Matemática pura existente, raíz restringida y evaluación finita | Reutilización directa sin modificar archivos anteriores |
| packages/math-labs/exploration.ts nuevo | Racional, exponencial, logarítmica, seno/coseno/tangente y transformaciones de las familias anteriores | Código original de esta entrega; sin copiar exámenes ni bancos externos |

La inspección del switch de familias de `funciones/src/math.ts` no encontró exponencial/logarítmica ni seno/coseno/tangente como familias de ese motor. La nueva implementación no presume haberlas portado de allí.

## Libros disponibles: muestra verificada

Se ejecutó `scripts/source-b/inventory-preuniversity.py` con el Python del runtime y pypdf. Sus resultados completos quedan en `.local-sources/preuniversity-pdf-index.json`. Se inspeccionaron los tres archivos siguientes; son un subconjunto de los 199 PDF previamente inventariados.

| Archivo relativo a libros_descargados | Extensión / páginas físicas | Páginas/temas y revisión | Autoría / permisos |
|---|---|---|---|
| Secundaria/3_Secundaria/MATEMÁTICA TEXTO.pdf | PDF, 410 páginas | Sin coincidencias de texto extraíble en búsqueda de funciones/trigonometría/exponenciales/dominio; tema por página pendiente de revisión visual | Metadatos sin autor; permiso pendiente |
| Secundaria/4_Secundaria/MATEMÁTICA TEXTO.pdf | PDF, 426 páginas | Mismo límite de extracción; páginas temáticas no verificadas | Metadatos sin autor; permiso pendiente |
| Secundaria/5_Secundaria/MATEMÁTICA TEXTO.pdf | PDF, 370 páginas | Render visual de páginas físicas 1–6, 78 y 100; índice físico 5–6 enumera exponenciales/logaritmos y trigonometría. Página física e impresa 78: función exponencial; página física e impresa 100: ángulo trigonométrico | Portada física 1 muestra Arca de Papel E.I.R.L.; pie de página 78 identifica a Manuel Coveñas Naquiche. No hay metadato Author. Reutilización no autorizada; permiso pendiente |

Las páginas 5–6 del índice remiten a páginas impresas 54 (logaritmos), 78 (exponencial), 100 (ángulo trigonométrico), 134 (razones de ángulo agudo), 176 (cualquier magnitud), 203 (circunferencia), 232 (ángulos compuestos) y 261 (transformaciones). Se verificaron directamente 78 y 100; los demás son referencias del índice, no páginas revisadas. El texto no extraíble no implica ausencia del tema; no se hizo OCR.

Hallazgo de revisión matemática: en la página 78, el texto describe valores estrictamente positivos pero la notación de resumen parece incluir 0 en el rango de la exponencial. No se importó esa notación. La implementación original usa (0,+∞) para la base y el intervalo abierto correspondiente después de transformar. Este hallazgo confirma que el material requiere revisión antes de cualquier uso pedagógico.

La portada y páginas inspeccionadas contienen una indicación de prohibición de reproducción. No se tomó como autorización la presencia local del PDF. Estado de todos los materiales externos: **borrador, permisos y revisión pendientes**. El producto usa actividades originales escritas para esta entrega.

## Reproducibilidad

```sh
python scripts/source-b/inventory-preuniversity.py --sources-root "C:\ruta\a\fuentes"
```

Requiere pypdf en el intérprete elegido; no añade dependencias al proyecto web. El runtime de esta PC ya lo incluye. La herramienta registra número de páginas, metadatos y coincidencias con número de página física; no publica contenido. Para revisión visual se usó Poppler pdftoppm con páginas seleccionadas; PNGs guardados solo en `.local-sources/`.

No se certifica cobertura de admisión ni alineación oficial UNMSM/UNI/PUCP. Las destrezas trabajadas son restricciones de dominio, lectura de parámetros, representaciones múltiples, periodicidad y justificación de casos degenerados.
