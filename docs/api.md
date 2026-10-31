# API preparada

GET /api/health y GET /api/product: diagnóstico y oferta pública, compra desactivada.
POST /api/demo/answer: muestra gratuita, JSON y mismo origen.
GET /api/me: sesión Clerk verificada; órdenes y derechos propios.
GET /api/training: sesión + compra; temario y preguntas sin reglas privadas.
POST /api/attempts: sesión + compra + origen; corrección privada y progreso.
GET /api/admin/orders: sesión y rol admin en D1; consulta acotada.
POST /api/checkout/mercadopago: sesión; únicamente entorno sandbox configurado y producto activo; precio D1 validado.
POST /api/webhooks/mercadopago: únicamente sandbox, firma HMAC, consulta de pago y actualización D1 transaccional.

Todavía no se expone un botón para comprar. No están implementados Yape, streaming privado, conciliación programada, administración de accesos ni límites distribuidos. Los fallos de configuración impiden acceder o comprar.

Checkout Orders requiere Idempotency-Key UUID y usuario autorizado de prueba. POST /api/orders/:id/reconcile permite consultar solo órdenes propias; no concede acceso por retorno ni por consulta aislada.

## Editor inicial de lecciones
GET /api/admin/lessons devuelve id, módulo, título y explicación para rol admin verificado por servidor.
POST /api/admin/lessons/:id recibe title (1–160), body (1–12000), previousTitle y previousBody. El servidor exige sesión, rol admin y mismo origen. Actualización y auditoría atómicas; conflicto 409 si cambió el texto. No modifica compras, roles ni respuestas. Las explicaciones son texto plano.
