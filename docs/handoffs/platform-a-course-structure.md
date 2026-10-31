# Frente A — estructura de curso en borrador
Rama: codex/platform-admin-a
Estado: en curso
Alcance: crear y ordenar módulos/lecciones privados; copia inicial del temario publicado. Sin publicación automática, sin cambios en pagos, laboratorios o permisos.
Archivos: course-structure.ts en API y web, index.ts, course-admin.tsx, style.css, migración 0006 y pruebas. Se mantienen independientes los ejercicios del banco y la estructura publicada.

## Entrega implementada
Estado: listo para revisión, sin despliegue remoto.
- GET/POST /api/admin/course-structure, protegidos con rol admin y mismo origen en mutaciones.
- Migración aditiva 0006: un borrador privado del SKU inicial, con revision para detectar conflictos; payload y bitácora en la misma transacción.
- Primera lectura sin borrador devuelve copia del temario publicado. Guardar nunca modifica modules, lessons, questions, attempts, progress ni derechos.
- Editor permite crear módulos, crear lecciones, editar títulos/textos y ordenar módulos o lecciones dentro del módulo con botones de teclado. Indica cambios sin guardar y protege la salida de página.
- Límites: 30 módulos, 50 lecciones por módulo, 200 lecciones totales y 1 MB de contenido. Sin publicación, borrado ni traslado entre módulos en esta entrega.
- El banco de preguntas sigue vinculado a lecciones publicadas; vincular preguntas a lecciones aún en borrador será una tarea posterior al contrato de publicación.

## Validación ejecutada
npm run check: 123 pruebas, TypeScript y build aprobados. SQLite comprueba privacidad, creación, orden, conflictos, validación y rollback de auditoría.
QA local de formulario con datos ficticios: creación de módulo/lección, cambio de orden y guardado de muestra correctos. No equivale a persistencia remota ni sesión admin real. Archivos temporales de QA eliminados. No se ejecutó npm ci; no hubo cambios de dependencias.

## Integración siguiente
Aplicar migraciones 0005 y 0006 en base de pruebas antes de integrar el runtime y verificar todo el panel con administrador real. No fusionado a main; no cambia el sitio publicado. No se editaron carpetas del frente B.
