# Despliegue administrativo — 31 octubre 2026
Base objetivo: D1 sistema-zenit-funciones-test que usa el sitio publicado. Contiene órdenes de validación reales; no es una base aislada vacía.
Propietario autorizó rol admin únicamente para cabellosalirrosas@gmail.com; comprobado role=admin y una entrada de auditoría owner.approved.admin.grant.
Punto Time Travel previo: 00000018-00000002-00005116-8ef75f17da8bda1ed25931218f3979ca. Restaurar todo afectaría cambios posteriores: no ejecutar sin revisión y aprobación.
Migraciones aditivas 0005, 0006 y 0007 aplicadas por consola D1 con sus nombres registrados en d1_migrations, verificados mediante SELECT. No borrado ni modificación de órdenes, derechos o contenido publicado.
Integrados ambos frentes sin descartar estilos: administración y laboratorios lineal/cuadrático. npm run check aprobado con 160 pruebas, TypeScript y build; check:pages aprobado. QA administrativo real de persistencia y permisos pendiente de sesión del propietario. No afirmar aceptación final de producción.
