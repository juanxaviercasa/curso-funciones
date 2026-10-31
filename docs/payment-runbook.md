# Pagos — contrato de implementación

Estado: bloqueados en la configuración actual. Adaptador sandbox implementado, pendiente validación externa. Producción se rechaza siempre.

Variante elegida: Checkout Pro Preferences. Leer su documentación vigente antes de conectar la cuenta. Crear orden autenticada con precio D1 (6700 céntimos); preferencia con unit_price 67 y currency_id PEN. Verificar soporte de idempotencia del endpoint concreto antes de usar encabezados.

Webhook: autenticar x-signature conforme a documentación vigente de Preferences; consultar /v1/payments/:id en servidor. Validar external_reference, collector_id, moneda, monto, SKU y modo de pruebas. Nunca confiar en cuerpo, retorno o captura. Eventos repetidos y fuera de orden deben converger mediante transacción D1 y fecha de actualización del proveedor. Fallos parciales deben poder reintentarse; no marcar procesado antes de conceder acceso de forma atómica.

Pendientes de prueba: aprobado, pendiente, rechazo, cancelación, duplicado, firma falsa, replay, manipulación de precio, otro receptor/SKU/moneda/importe, devolución, contracargo, retorno adelantado/tardío, timeout, eventos concurrentes y conciliación programada. Ninguno se presume validado con la base actual.

Yape: no mostrar QR ni recopilar teléfono/OTP hasta validar vía y autorización. Una captura nunca concede acceso. No almacenar OTP ni datos de tarjeta. Sin cobros reales hasta GO del propietario.

## Adaptador local preparado
El código ya incluye preferencia y webhook para sandbox. Para ensayar hacen falta cuenta de pruebas, secretos en Worker, APP_ORIGIN HTTPS autorizado, PAYMENTS_ENABLED=sandbox y activación explícita del producto en D1 de staging. La UI sigue sin botón de pago. La función testPaymentConfig rechaza siempre production. No habilitar la bandera sin revisión del propietario.
Política inicial de reembolsos: cualquier monto devuelto revoca el derecho de esa orden; otras compras aprobadas conservan acceso. Un estado terminal revocado no puede volver a aprobado por un evento antiguo. Pagos divididos no están soportados: cada pago debe ser exactamente S/67 o se rechaza su concesión.
La tolerancia local de firma es de cinco minutos; reintentos antiguos requieren conciliación autenticada pendiente.
