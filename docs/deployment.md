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

URL publicada (vista previa, sin cobros): https://funcionesdesdecero.sistemazenit.com
URL Pages: https://sistema-zenit-funciones.pages.dev

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

## Despliegue verificado — 30 de octubre de 2026
- Primer commit publicado en main: 06870c33568d71781d822faba826feaa2f545840.
- Proyecto Pages creado desde la integración GitHub existente: sistema-zenit-funciones. Cloudflare confirmó despliegue exitoso.
- Build npm run check, salida dist, Node 24. Backend Pages Functions compilado.
- Dominio funcionesdesdecero.sistemazenit.com conectado: Cloudflare sustituyó la reserva AAAA por CNAME proxied hacia sistema-zenit-funciones.pages.dev.
- HTTPS comprobado en ambos hosts: portada 200 y marca Sistema Zenit; health 200/staging/paymentsEnabled=false; producto 6700 PEN/purchasable=false; entrenamiento 401 sin identidad; demo 200/correct=true para 11.
- Prueba visible en navegador público: muestra responde «¡Correcto!» al introducir 11.
- Autenticación real, binding D1 remoto, Mercado Pago, Yape, videos y controles de lanzamiento continúan pendientes. No se activaron compras ni se añadieron secretos.
- Los próximos pushes a main activan la compilación y publicación automática.

## Actualización Orders — 31 de octubre de 2026
Se reemplazó la integración Preferences por Checkout Pro Orders conforme a la aplicación creada en el panel. 78 pruebas locales aprobadas y compilación Pages correcta. Base D1 de pruebas creada y migrada, producto inactivo. Cuenta de identidad, secretos, webhook y compra simulada contra Mercado Pago siguen pendientes. Véase docs/payment-runbook.md; sustituye las decisiones previas de Preferences. PAYMENTS_ENABLED continúa false.

Academia Zenit vinculada por autorización del propietario; instancia development. Clave publicable configurada para Worker. CLERK_SECRET_KEY debe ingresarla el propietario como secreto en Cloudflare; nunca en Git.
