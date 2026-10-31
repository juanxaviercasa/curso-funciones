# Desarrollo y despliegue

## Local
npm ci → npm run check → npm run db:migrate:local → npm run dev:worker.
No se requieren claves para la muestra. El UUID nulo de wrangler.jsonc es exclusivamente local.

## Staging — pendiente
1. Confirmar cuenta Cloudflare y costos antes de crear recursos.
2. Crear D1 de staging y definir binding DB en env.staging.d1_databases con ID real, separado de producción.
3. Aplicar migraciones remotas únicamente al entorno autorizado.
4. Configurar identidad, Turnstile, secretos y cuenta Mercado Pago de prueba mediante interfaces seguras. Nunca en Git.
5. Conectar GitHub privado, ejecutar checks y desplegar rama de staging.
6. Validar recorrido y registrar URL y evidencia antes de habilitar pagos de prueba.

No ejecutar deploy con identificadores pendientes. No existe configuración de producción preparada para cobros.

## Rollback y respaldo — por validar
Conservar versiones previas del Worker y documentar su restauración antes del lanzamiento. Crear respaldo/export D1 y ensayar restauración aislada antes de migraciones remotas. No borrar tablas para revertir órdenes reales. R2 privado y política de retención pendientes.

URL staging: PENDING_OWNER.

## Evidencia local
Se aplicaron ambas migraciones en D1 local. TypeScript, pruebas y build se ejecutaron correctamente. HTTP local: / y páginas informativas 200, /api/product precio 6700 y compra desactivada, /api/training 401 sin sesión, muestra numérica 200 con respuesta correcta. QA visual pendiente: el control de Chrome se detuvo al no poder verificar con seguridad la URL abierta. No se cambió ninguna cuenta externa.

## Primer despliegue Pages (autorizado por el propietario)
- Repositorio: juanxaviercasa/curso-funciones.
- Rama publicada inicial: main.
- Proyecto Pages: sistema-zenit-funciones.
- Build: npm run check (incluye build); salida: dist; raíz del repositorio.
- Node: 24. wrangler.jsonc define Pages Functions; wrangler.worker.jsonc conserva desarrollo Worker local.
- functions/[[path]].ts adapta el mismo backend a Pages. Sin claves de identidad, las APIs privadas deniegan acceso. No hay binding D1 remoto todavía.
- Variables no secretas: APP_ENV=staging y PAYMENTS_ENABLED=false. No introducir credenciales de cobro.
- Dominio objetivo: funcionesdesdecero.sistemazenit.com. Sustituir únicamente su registro de reserva AAAA 100:: por el destino Pages cuando el despliegue esté listo.
- Publicación de vista previa informativa, sin venta, sin políticas legales vigentes. Integraciones externas pendientes.
