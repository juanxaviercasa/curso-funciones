# Estudio de curso propio — Frente A

Rama: codex/course-studio-a. Componentes propios React/CSS; sin código copiado de LMS externos ni dependencias nuevas. Composición orientada por los proyectos locales revisados en platform-a-frontend-reuse-audit.md.

## Implementación
- Administración con cuatro secciones: contenido, textos publicados, preguntas e importación. Las secciones permanecen montadas para conservar cambios locales al navegar.
- Editor del borrador con temario lateral, selección de lección, creación y orden de módulos/lecciones, explicación, vista previa local del texto y guardado revisionado mediante la API existente.
- Estado de guardado y protección al cerrar con cambios pendientes. El guardado no publica. La vista previa de lección usa los cambios locales; el enlace al aula de muestra indica que utiliza datos independientes.
- Aula agrupa visualmente las lecciones por módulo y mantiene el progreso existente.
- Sin cambios de backend, permisos, pagos ni migraciones.

## Validación real
172 pruebas, typecheck, build y compilación de Pages Functions aprobados. diff --check aprobado. QA local en navegador con API ficticia en memoria: seleccionar, editar título, previsualizar, cambiar de sección sin perder cambios y guardar revisión 2. Se revisó captura estrecha y se corrigió el encabezado global. Harness temporal retirado.
No se probó escritura real con la sesión administrativa del propietario en esta entrega. Videos privados, materiales y publicación de estructura siguen pendientes; tampoco se añade creación de varios cursos.
