# Inicio de academia — Frente A

Rama: codex/academy-home-a. Componentes propios, sin dependencias nuevas.

- Mis entrenamientos muestra tarjeta del curso, acceso, progreso de lecciones y próxima lección desde /api/training. No se inventan porcentajes. El curso se abre con su recorrido existente.
- Laboratorios gratuitos accesibles desde la tarjeta, separados del progreso.
- Órdenes y controles existentes se conservan en un desplegable; no se alteran permisos ni pagos.
- Administración muestra únicamente el estudio del curso, sin anteponer compras. Ingreso conserva destino administrativo.

Validación: 176 pruebas, typecheck, build, Pages Functions y diff --check aprobados. QA visual local del inicio con datos ficticios (1 de 2 lecciones); harness temporal eliminado. Antes de editar se confirmó en producción que la sesión administradora carga cinco módulos y revisión 0; no se guardó ni publicó ningún borrador real.
Pendientes: videos/materiales privados, carga de contenido y QA de escritura del propietario.
