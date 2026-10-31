# Arquitectura y auditoría inicial

## Inventario — 30 de octubre de 2026
La carpeta solo contenía el plan maestro. El propietario indicó el repositorio vacío https://github.com/juanxaviercasa/curso-funciones.git. Se creó una rama local feat/msv-foundation; no se presume visibilidad privada ni protección de ramas hasta verificarlas en GitHub.

## Decisiones
- React + TypeScript + Vite, Worker TypeScript y D1, desplegados bajo un mismo origen. Worker sirve assets estáticos y protege rutas API. Evita CORS innecesario.
- Wrangler independiente de Vite: misma API de Worker en local y destino Cloudflare. Configuración local D1 sin recursos remotos.
- Checkout Pro vía Preferences, sin mezclar Orders. Integración futura deshabilitada hasta contar con identidad y entorno de prueba.
- Autenticación gestionada con sesión verificada en backend: proveedor PENDING_OWNER. No se simulan usuarios ni se crean contraseñas propias.
- Banco premium en D1 y videos en R2 privado por configurar. Ninguna solución premium en el cliente.
- Yape permanece no disponible hasta inspeccionar la cuenta y validar la vía oficial; revisión manual solo con autorización y fuente receptora auténtica.
- Sin publicación, dominio ni activación de servicios de pago en esta etapa.

## PENDING_OWNER
Cuenta/zona Cloudflare, dominio, proveedor de identidad y correo, vendedor legal, soporte, políticas revisadas, contenido audiovisual, aplicación y cuenta vendedora Mercado Pago Perú, vía Yape. Ingresar secretos solo en formularios seguros del proveedor.

## Fuentes consultadas
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/d1/
- https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-preferences/create-payment-preference
- https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-preferences/payment-notifications

Costos, cuotas, región y capacidades de la cuenta: pendientes de inspección; ninguna estimación se presenta como confirmada.

## Ampliación local
Se preparó Clerk React + Backend con bearer de sesión verificado, authorizedParties y correo verificado. Configuración externa pendiente. El frontend no guarda JWT en localStorage. Las APIs privadas comprueban compra en D1; roles proceden de D1, no del navegador. La clave publicable es pública; la secreta solo Worker.
Se implementó un adaptador Mercado Pago exclusivo de pruebas, bloqueado en producción, con HMAC, consulta del recurso y batch transaccional D1. No probado aún contra cuenta real de sandbox.

## Cambio de marca autorizado — 30 de octubre de 2026
El propietario reemplaza la marca del plan original por Sistema Zenit. La instrucción posterior prevalece sobre el nombre comercial original. Paleta azul, naranja y amarillo; mensajes educativos positivos, sin referencias mitológicas o filosóficas. El plan original se conserva como referencia histórica, con esta decisión como actualización. SKU y precio permanecen.

Corrección de transcripción: el dominio verificado es sistemazenit.com; la marca correcta es Sistema Zenit. La transcripción Xenic era incorrecta. Se conserva funcionesdesdecero.sistemazenit.com y la paleta azul/naranja/amarillo.

Despliegue inicial: Pages con Functions adaptando el mismo Worker, compatible con el flujo GitHub ya abierto por el propietario. No cambia el modelo D1 ni el control de acceso. Se separa la configuración local Worker de la configuración Pages para no publicar un UUID D1 de reserva.

## Actualización Orders — 31 de octubre de 2026
Se reemplazó la integración Preferences por Checkout Pro Orders conforme a la aplicación creada en el panel. 78 pruebas locales aprobadas y compilación Pages correcta. Base D1 de pruebas creada y migrada, producto inactivo. Cuenta de identidad, secretos, webhook y compra simulada contra Mercado Pago siguen pendientes. Véase docs/payment-runbook.md; sustituye las decisiones previas de Preferences. PAYMENTS_ENABLED continúa false.
