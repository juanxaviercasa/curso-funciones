# Auditoría de reutilización del frontend — 31 octubre 2026

Revisión directa de código local. No se ejecutaron estas aplicaciones ni se verificaron sus servicios remotos. Esta entrega no cambia la aplicación publicada.

## Conclusión
academia-zenit es la fuente principal para la experiencia del alumno; Rumbo_SanMarcos aporta la estructura administrativa. No se encontró un creador visual completo de cursos en las rutas y componentes revisados. No hace falta buscar otro repositorio para empezar el frontend; sí falta construir el recorrido de autoría.

## Evidencia y selección
- academia-zenit/src/features/courses/components/CourseCard.tsx: tarjetas con portada, categoría, nivel y progreso. Adaptar a los derechos de acceso y catálogo reales de Sistema Zenit.
- academia-zenit/src/features/courses/components/CourseSidebar.tsx y CourseSidebarItem.tsx: índice de capítulos ordenados y estado. Adaptar a módulos y lecciones del contrato actual.
- academia-zenit/src/features/courses/components/VideoPlayer.tsx: marco audiovisual, carga, bloqueo y siguiente lección. Separar Mux/Next de presentación; corregir el estado completado que se muestra antes de confirmar la respuesta y manejar errores HTTP.
- academia-zenit/src/features/user-panel/components/DashboardSidebar.tsx, DashboardNavbar.tsx, DashboardStats.tsx y FacultyProgressCard.tsx: estructura de escuela y resumen del estudiante. Mostrar únicamente datos persistidos reales.
- academia-zenit/src/app/(course)/courses/[courseId]/chapters/[chapterId]/page.tsx: video, resumen, recursos y navegación. Contiene hasAccess=true, progreso simulado, video demo y botones de descarga sin acción. Reutilizar composición visual; no trasladar esas simulaciones al aula privada.
- academia-zenit/src/app/(dashboard)/page.tsx: cursos de demostración con porcentajes fijos. No son evidencia de progreso funcional.
- academia-zenit/prisma/schema.prisma: Course, Chapter, Attachment, UserProgress y estados isPublished. Modelo útil, pero Chapter no representa una capa separada módulo/lección; adaptar a D1, no migrar toda la arquitectura.
- academia-zenit/src/app/api/courses/route.ts: existe POST para crear curso, pero no basta para un editor completo; autentica y crea usuario TEACHER sin una comprobación explícita de rol administrativo. No portar ese permiso.
- Rumbo_SanMarcos/frontend/src/components/AdminLayout.tsx: menú y marco administrativo; adaptar a móvil y al estilo azul/naranja.
- Rumbo_SanMarcos/frontend/src/pages/AdminQuestionsPage.tsx, AdminImportPage.tsx, AdminAuditPage.tsx: formularios de preguntas, importación y auditoría. Adaptar presentación sobre las API privadas actuales, sin incorporar PocketBase.
- prisma_data/prisma/schema.prisma: teoría, ejemplos por pasos, pistas y problemas. app/page.tsx permanece como plantilla inicial de Next; no aporta una escuela visual terminada.
- profesor-matematica/sitio-profesor-matematica/components/: laboratorios, diagnóstico y componentes de interfaz; útil para práctica, no sustituye la administración del curso.
- estudio_uni/src: solo syllabus.json en el recorrido de fuentes; no se identificó allí un creador de cursos. MathVerse contiene principalmente recursos compilados; portafolio_juancabello es un portafolio, no un LMS.

## Frente propuesto
1. Escuela del alumno: navegación consistente, tarjeta del curso, continuar y avance real.
2. Aula: video dominante, índice por módulos, lección activa, resumen/materiales/práctica, anterior/siguiente y móvil.
3. Administración: listado de cursos y editor con secciones Portada, Contenido y Vista del alumno. Incorporar los borradores existentes; indicar de forma clara lo que se guarda y lo que se publica.
4. Completar autoría: metadatos del curso, medios privados y publicación versionada. El soporte para varios cursos requiere contratos/migraciones; no anunciarlo como terminado por disponer de tarjetas.

Conservar Clerk, D1 y Mercado Pago. No reutilizar Stripe, acceso libre de demo, claves, node_modules ni compilados. Verificar autoría de fragmentos y licencias de dependencias al portar. La revisión de código permite seleccionar piezas, no certificar su apariencia ni funcionamiento en navegador.
