# Medios privados — Frente A

Rama codex/private-media-a. Integración preparada con MEDIA_ENABLED desactivado por defecto. El propietario autorizó R2 privado; la suscripción sigue pendiente del paso de aceptación en el dashboard. No se creó bucket ni se aplicó migración remota.

## Implementado
Carga administrativa MP4 hasta32MiB y PDF hasta10MiB, máximo20 materiales por lección. Firma de cabecera comprobada, sin conversión de video ni análisis antivirus. Cargas asociadas inmediatamente a lecciones publicadas, confirmación UI y auditoría. Reemplazo conserva objetos anteriores pero invalida su reproducción; limpieza/retención administrativa pendiente.
Enlaces HMAC de cinco minutos, comprobación de usuario/acceso en cada solicitud, rangos y HEAD, caché privada no-store, PDF como descarga y MP4 reproducible. Enlace compartible hasta expirar; no DRM. Token temporal podría aparecer en registros de URL: evitar capturar querystrings en observabilidad.
UI Videos y materiales y recursos del aula. No modifica laboratorios B. Tarea B publicada en labs-b-next-preuniversitario.md.

## Activación pendiente
1. Propietario acepta suscripción R2 en dashboard. Crear bucket sistema-zenit-media-private Standard sin r2.dev ni dominio público.
2. Aplicar 0008_lesson_assets.sql y registrar migración D1 siguiendo procedimiento existente.
3. Añadir binding PRIVATE_MEDIA al bucket, secreto MEDIA_SIGNING_KEY aleatorio de al menos32 caracteres y MEDIA_ENABLED=true; desplegar conjuntamente. No guardar secreto en Git.
4. Cargar recurso original autorizado pequeño, verificar reproducción, PDF y denegación sin permisos. Sin activación el listado retorna enabled:false y no consulta tabla nueva.

## Validación
181 pruebas, TypeScript, build y Pages Functions aprobados (máquina local). SQLite aislado con R2 simulado: autorización, caducidad, rangos, HEAD, nombre/formato, revocación, sustitución de video y limpieza tras fallo. No se afirma carga ni reproducción real con R2. No hay publicación de libros ni video del propietario.
