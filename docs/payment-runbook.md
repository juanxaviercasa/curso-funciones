# Mercado Pago — Checkout Pro Orders

Estado: código migrado a Orders; compras desactivadas en Cloudflare. No se ha realizado compra de prueba contra el proveedor. La aplicación creada por el propietario es Sistema Zenit - Funciones, ID público 2136866391679868. No hay secretos en Git.

## Contrato vigente
- Única API: POST /v1/orders y GET /v1/orders/:id. Se eliminan llamadas a /checkout/preferences y /v1/payments.
- El servidor consulta SKU y precio D1: 6700 céntimos; envía total_amount y unit_price como "67.00", quantity=1 y external_code=MSV-FUN-001.
- Checkout exige sesión, mismo origen, producto activo y usuario local incluido en PAYMENT_TEST_USER_IDS. El UUID Idempotency-Key del navegador se asocia al usuario; la orden local persistente se usa como X-Idempotency-Key del proveedor. Tras timeout, se repite el mismo cuerpo y la misma clave.
- config.online define retornos informativos. Un parámetro status=approved no concede derechos.
- Solo se admiten identificadores ORDTST y URL oficial peruana vinculada a la misma order. Producción se rechaza siempre.
- Webhook: type=order, data.id alfanumérico, x-signature HMAC-SHA256 con ID en minúsculas, request-id y timestamp. La tolerancia local es cinco minutos. El cuerpo debe indicar live_mode=false; nunca se usa para conceder acceso sin consultar el recurso autenticado.
- Recurso: validar Perú/PEN, vendedor configurado, application_id, referencia, SKU/cantidad/importe y provider_order_id si ya existe. Solo processed/accredited, total_paid_amount 67.00 y una transacción acreditada completa conceden acceso.
- Devolución parcial/total y contracargos revocan el derecho de esa orden. La política conservadora de contracargos mantiene revocación hasta revisión; no recupera acceso automáticamente.
- D1 batch actualiza evento/pago/orden/derecho de manera transaccional. Eventos viejos o pendientes no deshacen una aprobación; una revocación terminal no se reactiva.
- POST /api/orders/:id/reconcile consulta una orden propia. Puede revocar, pero no concede acceso sin webhook firmado. Conciliación programada y recuperación de notificaciones tardías pendientes.

## Configuración pendiente (interfaces seguras)
1. Conectar identidad Clerk: clave publicable para Vite/Worker, secreta solo Worker. Verificar correo y configurar protección antiabuso.
2. Access Token de PRUEBA en MERCADOPAGO_ACCESS_TOKEN; identificador del vendedor de ese token en MERCADOPAGO_COLLECTOR_ID. No asumir que coincide con el vendedor de producción.
3. Configurar Webhooks de la aplicación en modo Prueba hacia https://funcionesdesdecero.sistemazenit.com/api/webhooks/mercadopago, tópico de Orders (el panel puede denominarlo orders_v2; la notificación documentada usa type=order). Guardar el secreto como MERCADOPAGO_WEBHOOK_SECRET.
4. Tras verificar identidad y claves, aprobar la habilitación sandbox, añadir solo el usuario de prueba a PAYMENT_TEST_USER_IDS y activar el producto en esta D1 de pruebas. Nunca habilitar producción.
5. Ejecutar éxito, pendiente, rechazo, cancelación, duplicado, firma falsa, replay, importe/moneda/SKU/vendedor/app incorrectos, devolución, contracargo, timeout y orden de llegada. Las pruebas unitarias no sustituyen el ensayo real del sandbox.

## D1 de pruebas
Nombre sistema-zenit-funciones-test; ID 14c6216f-dc0d-4524-836e-699fcd6f2781. Creada por dashboard dentro del límite observado (10 bases; cuenta sin bases previas). Migraciones 0001, 0002 y 0003 ejecutadas en consola, verificadas y registradas en d1_migrations. Producto permanece active=0. No hay alumnos ni pagos reales.

## Evidencia local
78 pruebas aprobadas, TypeScript y build correctos, Pages Functions compilado. SQLite valida atomicidad, rollback, aislamiento, duplicados, devoluciones e idempotencia de checkout. Pendiente probar credenciales y transacción contra Mercado Pago, bindings remotos con sesión real y concurrencia distribuida.

Fuentes oficiales consultadas:
- https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-orders/create-order
- https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-orders/notifications
- https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-orders/web-integration/configure-back-urls
- https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-orders/payment-management/status/order-status

Yape queda pendiente de validación independiente; no se promete que esté disponible en Checkout Pro.
