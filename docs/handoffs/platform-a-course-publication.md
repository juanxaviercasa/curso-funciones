# Publicación del temario — Frente A

Rama: codex/course-publish-a. Continúa el estudio propio; sin dependencias ni migraciones nuevas.

## Comportamiento
POST /api/admin/course-structure/publish requiere rol admin, origen válido, revisión guardada y huella del contenido publicado. La interfaz requiere guardar primero y confirmar antes de publicar. La muestra pública sigue siendo independiente.

La publicación exige módulos con lecciones y explicaciones no vacías. Conserva todos los IDs publicados; no permite eliminación. Actualiza títulos, orden, textos y relación módulo/lección, sin sobrescribir video_key, preguntas ni progreso. Auditoría con copia del estado anterior y escrituras se realizan en un único lote transaccional. La guarda SQL comprueba de nuevo borrador y estado publicado dentro de ese lote.

GET del borrador añade publishedVersion; el cliente anterior sigue siendo compatible para guardar. La nueva interfaz necesita el backend desplegado conjuntamente.

## Validación
176 pruebas, typecheck, build, Pages Functions y diff --check aprobados. Pruebas HTTP con SQLite real aislado: publicación, conservación de video/preguntas/progreso, versión obsoleta, permisos, contenido incompleto, cambio concurrente dentro del lote y reversión total ante fallo. No se publicó ningún borrador real ni se modificó D1 remoto durante esta entrega. Validación visual autenticada y publicación por el propietario pendientes.

## Siguiente
Medios privados, revisión del contenido original y recorrido de administración con el propietario. El historial conserva el estado anterior en auditoría; todavía no hay botón de restauración. No soporta eliminar contenido ni crear otros productos.
