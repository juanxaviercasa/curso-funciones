# Validación controlada de pagos reales — preparación

Estado: implementación preparada; no se autoriza ningún cobro con este documento. Ventas públicas desactivadas.

## Evidencia ya obtenida
- Sandbox: pago aprobado y acceso concedido tras notificación firmada.
- Checkout real de inspección: Yape visible como invitado. Celular y código se ingresan solo en Mercado Pago. No QR.
- La orden de inspección preview_98df761c-6c6c-4963-a26c-ab5181fa6519 no es una compra del alumno y no concede derechos. No pagarla.

## Separación y controles
Migración 0004 agrega payment_environment a orders; todos los registros anteriores quedan sandbox. No desplegar antes de aplicar esa migración remota. Revertir código es posible sin borrar la columna.

POST /api/webhooks/mercadopago-production recibe solo IDs ORD reales y live_mode=true. La firma usa un secreto separado. Después consulta Orders con token real, verifica vendedor 291342046, aplicación 2136866391679868, PEN/Perú, referencia de una orden local real, SKU, cantidad e importe exacto S/67. Solo processed/accredited completo habilita acceso. Usa la misma transacción e idempotencia que sandbox. Reembolsos y contracargos revocan.

## Configuración del propietario pendiente
1. Aplicar migración 0004 en D1 y verificarla.
2. Desplegar código con PRODUCTION_WEBHOOKS_ENABLED=false y PRODUCTION_CHECKOUT_ENABLED=disabled.
3. En Mercado Pago, modo Producción de la aplicación, configurar tópico de Orders hacia https://funcionesdesdecero.sistemazenit.com/api/webhooks/mercadopago-production, siguiendo la documentación oficial. El propietario guarda el secreto en Cloudflare como MERCADOPAGO_PRODUCTION_WEBHOOK_SECRET, nunca en chat o repositorio.
4. Tras verificar configuración, habilitar recepción de notificaciones. Esto no abre compras. Se necesita un alumno de prueba sin acceso (PRODUCTION_PAYMENT_USER_IDS contiene IDs locales autorizados).
5. Solicitar autorización explícita antes de habilitar PRODUCTION_CHECKOUT_ENABLED=restricted y crear una compra real S/67 para ese alumno. Endpoint autenticado POST /api/production-checkout permanece inaccesible mientras esté disabled. El dueño efectúa el pago con un comprador distinto del vendedor; no compartir OTP.
6. Verificar evento firmado recibido, pago aprobado, un solo derecho, titular correcto, acceso sin depender del retorno y duplicados sin efectos adicionales. Mantener ventas públicas cerradas.

La conciliación actual recupera notificaciones firmadas ya recibidas. No reemplaza una notificación ausente; reenvío del proveedor y operación de soporte siguen pendientes. No afirmar validación integral de producción antes del ensayo real.

Fuente: https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-orders/notifications?scope=prod
