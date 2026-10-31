# Recursos del frente B

Fuentes locales: carpetas hermanas `funciones` y `api_reverse` dentro de Music en esta PC. No son dependencias de compilación del laboratorio entregado.

## Laboratorio

Referencia: `funciones/src/math.ts`, `src/screens/Lab.tsx` y `src/components/InteractiveGraph.tsx`. La primera adaptación implementa f(x) = mx + b, evaluación finita y muestreo acotado; SVG, controles y estilos se escribieron para el contrato de este repositorio. No se trasladaron componentes completos, código de sincronización Supabase, fórmulas de MathLive/KaTeX, Remotion ni sus dependencias.

Las funciones no constantes tienen dominio y rango reales; la función constante tiene dominio real y rango de un elemento. La gráfica muestra únicamente una ventana finita. No interpreta fórmulas ingresadas por el usuario.

## Inventario local existente

Reproducir con `python scripts/inventory-local-sources.py --sources-root "C:\ruta\a\fuentes"` desde el proyecto. Esta herramienta es la entrega histórica, ya integrada por el coordinador; no fue modificada por el frente B.

- 199 archivos PDF, 199 SHA-256 distintos, 13.704.044.429 bytes; todas las cabeceras comienzan con `%PDF-`. No equivale a verificación integral de PDF ni a 199 títulos diferentes.
- Categorías: Alumnos 78, Docentes 60, GuiasProfesor 6 y Secundaria 55.
- Primaria: 5503 filas, 2937 ID únicos. Secundaria: 4118 filas, 2604 ID únicos. Los catálogos contienen materias diversas; no son bancos exclusivos de funciones ni respuestas corregidas.
- Formatos: CSV, JSON y PDF. Procedencia declarada por los scripts: catálogos NovaSchool y lanzadores Krismar. No se ejecutaron peticiones ni se validó vigencia de enlaces.
- Permisos de redistribución y revisión matemática: pendientes. Estado para una importación futura: borrador.

Los manifiestos detallados quedan en `.local-sources/` y los materiales completos fuera de Git. Los recursos que solo existen en la otra laptop se inventarían allí; no se presuponen disponibles en esta PC.
