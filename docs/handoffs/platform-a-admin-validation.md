# Validación integrada del panel administrativo — Frente A
Rama: codex/platform-admin-a
Estado: validación local completada; conexión remota pendiente.
Cuenta elegida por el propietario para futura prueba administrativa: cabellosalirrosas@gmail.com. La selección no constituye evidencia de rol existente. No se modificaron roles ni credenciales.

## Evidencia de este hito
- npm run db:migrate:local aplicó 0004, 0005 y 0006 correctamente a msv-local. No usó --remote ni modificó D1 de la aplicación publicada.
- npm run check: 127 pruebas aprobadas, TypeScript y build correctos.
- npm run check:pages: Worker de Pages compilado correctamente.
- Nueva suite tests/admin-http.test.js recorre Request/Response del Worker, router, parseo, servicio y SQLite real. Solo la identidad Clerk está sustituida por fixtures dentro de la suite, sin bypass en código de aplicación.
- Verifica 401 sin identidad válida, 403 para alumno u origen ajeno, 400 para respuesta inválida, guardado/lectura posterior, revisión 409, no-store y conservación de lecciones/preguntas publicadas.
- La matriz no sustituye QA autenticado con Clerk real ni persistencia D1 remota.

## Próximo paso concreto
1. Consultar rol de la cuenta elegida en la base remota y verificar su sesión sin exponer claves.
2. Si falta rol, preparar el cambio específico y obtener confirmación antes de ampliar acceso administrativo.
3. Preparar entorno de prueba con migraciones 0005/0006 y runtime de esta rama. Evitar usar preview con secretos de producción o apuntarlo inadvertidamente a la base publicada.
4. Con la cuenta admin real: crear borrador, recargar, comprobar permanencia, abrir dos sesiones y verificar conflicto. Alumno debe recibir 403. No publicar contenido de muestra.
5. Integrar main solo después de verificar configuración y migraciones objetivo.

No se modificaron rutas de los laboratorios del frente B. El sitio publicado sigue en main; estas entregas permanecen en la rama de trabajo.
