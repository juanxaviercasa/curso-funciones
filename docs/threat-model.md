# Amenazas y controles

Implementado: entrada numérica estricta sin eval; precio fijo; ningún acceso concedido por retorno; API privada denegada; pagos bloqueados; cabeceras CSP y no-store para API; consultas/migraciones sin secretos; no contenido premium público.

Antes de lanzamiento: identidad verificable y sesión segura, autorización por usuario/compra en cada endpoint, roles administrativos, CSRF, límites distribuidos, Turnstile validado en servidor, límites de cuerpo por streaming, firmas y replay, consulta de receptor/precio/estado, idempotencia transaccional y auditoría. Las cabeceras no sustituyen estos controles.

Riesgos pendientes: demo pública sin rate limit remoto; documentos legales sin aprobar; sin respaldo/restauración ensayados; sin monitoreo ni pipeline remoto verificado. Mantener compra desactivada y entorno no indexable.
