# MSV-FUN-001 — Plan maestro de implementación para agente de desarrollo

**Proyecto:** Matemáticas sin Vergüenza (MSV)  
**Producto inicial:** Funciones desde Cero para la Universidad  
**Identificador:** MSV-FUN-001  
**Precio inicial fijo:** S/ 67.00 (PEN)  
**Mercado:** Perú; estudiantes de últimos años de secundaria, postulantes y primeros ciclos universitarios  
**Modalidad:** entrenamiento digital con hasta 120 minutos de videos, teoría breve, práctica autocorregida, pistas, evaluación y seguimiento  
**Infraestructura objetivo:** GitHub + Cloudflare + Mercado Pago; Yape según vía técnicamente validada  
**Fecha de especificación:** 30 de octubre de 2026  
**Estado:** especificación para ejecutar; no implica que haya sistema desplegado o integraciones aprobadas.

---

## 0. Instrucción principal: leer antes de programar

Actúa como **líder técnico, ingeniero full-stack, diseñador de experiencia educativa, especialista en seguridad de aplicaciones y ejecutor de pruebas**. Tu misión es construir una **primera versión segura y funcional**, desplegable desde GitHub a Cloudflare, para vender y entregar el producto MSV-FUN-001 por S/67. No cambies el producto, su precio, nombre, audiencia ni conviertas el proyecto en un marketplace de cursos. Enfócate en producir y probar un flujo de compra y aprendizaje de principio a fin.

**Debes trabajar en el repositorio y en el navegador cuando tengas acceso autorizado.** Si el entorno permite control del navegador, úsalo para inspeccionar GitHub, Cloudflare y Mercado Pago, solicitar al propietario inicios de sesión y verificaciones de dos factores, y configurar recursos. No afirmes que una acción fue realizada sin evidencia visible en el servicio. No pidas ni copies contraseñas, códigos OTP, claves secretas, tokens bancarios o credenciales en el chat, código fuente, capturas, logs o archivos del repositorio; el propietario debe ingresarlos en los formularios seguros correspondientes.

**Nunca hagas una venta real ni un pago real para probar sin autorización explícita.** Primero ejecuta pruebas con cuentas y credenciales de prueba. Pide aprobación antes de activar producción, cargar costos, publicar políticas o crear recursos con facturación.

Si algo requiere datos del propietario que aún no se conocen (dominio, correo de soporte, nombre legal de vendedor, cuentas, datos tributarios), deja la configuración como `PENDING_OWNER` y continúa con las partes independientes. No inventes datos personales, credenciales ni autorizaciones.

## 1. Decisiones comerciales inamovibles para v1

- Marca: **Matemáticas sin Vergüenza**.
- Producto: **Funciones desde Cero para la Universidad**.
- SKU: `MSV-FUN-001`.
- Precio: **6700 céntimos de PEN** (S/67.00) en la plataforma propia. El backend determina el precio; el navegador no lo envía como fuente de verdad.
- Oferta: entrenamiento interactivo de funciones, no un curso universitario completo.
- Propuesta de valor: aprender los fundamentos prácticos de funciones, practicar problemas graduados, recibir autocorrección y medir avances.
- Público: último tramo de secundaria, postulantes y estudiantes universitarios iniciales; no prometer aprobar exámenes completos ni dominar todas las funciones en dos horas.
- Contenido audiovisual meta: máximo 120 minutos, sujeto a producción real.
- Canal inicial: sitio propio. Integración con Udemy no forma parte del MVP.
- Prioridad: **poder recibir el pago, conceder acceso confiable y entregar práctica funcional** antes de desarrollar un catálogo grande.

## 2. Alcance del MVP (hacer ahora)

### 2.1 Sitio público

1. Home/landing específica del producto con identidad MSV, título, problema, resultados esperados, contenido, muestras, formato, precio S/67, preguntas frecuentes y CTA «Comenzar entrenamiento».
2. Páginas: `/`, `/entrenamiento/funciones`, `/ingresar`, `/registro`, `/mis-entrenamientos`, `/aprender/funciones`, `/pago/resultado`, `/privacidad`, `/terminos`, `/reembolsos`, `/contacto`.
3. Diseño limpio, profesional, rápido, mobile-first, accesible; animaciones discretas; sin logotipos de universidades que sugieran afiliación.
4. SEO básico: títulos, descripción, canonical, Open Graph, sitemap, robots, datos estructurados solo cuando correspondan.
5. Previsualización gratuita con ejercicios reales de muestra, claramente separada del contenido de pago.

### 2.2 Identidad y área privada

1. Registro e inicio de sesión con una solución de autenticación compatible con Cloudflare y probada en Workers. Preferir **magic links/códigos de un solo uso o proveedor gestionado con sesiones verificadas en backend** frente a desarrollar contraseñas caseras.
2. Protección de todas las rutas privadas por sesión y titularidad de compra.
3. Panel del alumno: producto adquirido, avance por módulo, intentos, puntuaciones, temas dominados y reanudación.
4. Panel mínimo del administrador: consultar órdenes, pagos, incidencias, alumnos y concesiones/revocaciones de acceso con registro auditable. Panel protegido por roles en servidor; no basta ocultar botones.
5. Reenvío o recuperación de acceso sin revelar existencia de cuentas.

### 2.3 Experiencia educativa

Estructura de referencia (ajustable sin cambiar el producto):

- M1: concepto, notación, evaluación y reconocimiento de funciones (~15 min video).
- M2: dominio y rango (~25 min).
- M3: gráficas, funciones elementales y transformaciones (~25 min).
- M4: operaciones, composición e inversas básicas (~25 min).
- M5: aplicación, errores típicos y práctica integrada (~20 min).

Videos totales objetivo: ~110 minutos. No crear promesas de cantidad de ejercicios que aún no existen. Usar contenido **original** y matemáticamente revisado, con dos modos: explicación y entrenamiento.

Tipos de preguntas v1: opción múltiple, respuesta numérica exacta, selección de intervalos/conjuntos y ejercicios con gráfica si el validador es seguro. Guardar `question_id`, tema, dificultad, intento, respuesta, corrección y fecha. Permitir pista escalonada y explicación. Las respuestas correctas y reglas de evaluación del contenido premium **no deben exponerse masivamente en el frontend** antes de responder. Usar validadores del lado servidor y banco de preguntas privado. Evitar prometer un CAS general para equivalencia simbólica en v1; definir comparadores fiables para cada tipo.

Videos: almacenamiento privado en Cloudflare R2 u otro proveedor de streaming adecuado, entregados con URLs de corta duración o mecanismo de acceso autorizado. Verificar costos y capacidades antes de decidir. No poner los originales premium en `/public`, no enlazar bucket público, no considerar `robots.txt` una barrera. Una URL temporal puede compartirse hasta expirar y no impide capturas/grabación: comunicar protección razonable, no DRM absoluto.

## 3. Arquitectura técnica propuesta

- **Frontend:** React + TypeScript + Vite, interfaz adaptable. Alternativa SSR sobre Workers solo si hay justificación concreta.
- **Backend:** Cloudflare Workers con TypeScript y router ligero (p. ej., Hono), endpoints API y controles de seguridad en servidor.
- **Base de datos:** Cloudflare D1 (SQLite) con migraciones versionadas y consultas preparadas/parametrizadas.
- **Archivos privados:** Cloudflare R2. Evaluar Cloudflare Stream si se necesita reproducción adaptativa y protección adicional.
- **Autenticación:** servicio compatible y validado para Workers o implementación de sesiones con proveedor confiable; no crear sistema de passwords artesanal. Cookies `HttpOnly`, `Secure`, `SameSite` apropiado, renovación/revocación, CSRF para operaciones con sesión.
- **Pagos:** Mercado Pago **Checkout Pro** como camino de menor complejidad inicial, con generación de preferencia/orden en backend y webhooks autenticados. Elegir **una sola variante oficial vigente** de Checkout Pro (Preferences o Orders) y respetar su esquema de API y eventos; no mezclar instrucciones de variantes distintas.
- **Yape:** opción A: validar disponibilidad de Yape vía integración oficial de Mercado Pago Checkout API en Perú para la cuenta del negocio; podría requerir otra variante de checkout y un flujo OTP. Opción B: Yape directo, con confirmación administrativa basada en registros auténticos del receptor, nunca solo en captura. La opción B no tiene activación automática hasta contar con integración legítima de conciliación.
- **GitHub:** repositorio privado, revisión de pull requests, ramas protegidas y checks automáticos.
- **Cloudflare:** Git integration para despliegue y previews; separar `development`, `staging`, `production` y sus credenciales.
- **Seguridad perimetral:** Cloudflare WAF/rate limiting según plan, Turnstile + validación obligatoria en backend para registro/login/abuso, headers de seguridad y monitoreo.

### 3.1 Estructura sugerida

```text
msv-fun-001/
  apps/
    web/                   # Vite/React/TS
    api/                   # Cloudflare Worker/TS
  packages/
    shared/                # tipos y esquemas de validación
    math-engine/           # evaluadores matemáticos testeados
  content/
    course-outline/        # temarios originales; sin soluciones premium públicas
    samples/               # demostraciones gratuitas
  database/
    migrations/
    seeds-dev/
  tests/
    e2e/
    payments/
    security/
  docs/
    architecture.md
    api.md
    threat-model.md
    payment-runbook.md
    deployment.md
    incident-response.md
  .github/workflows/
  .gitignore
  .env.example             # SOLO nombres, NUNCA valores secretos
  README.md
```

## 4. Modelo de datos mínimo

Crear tablas, claves e índices apropiados para:

- `users`: id, email normalizado, datos mínimos, created_at.
- `sessions` si la solución elegida las usa: id opaco hasheado, expiración, revocación.
- `products`: sku, nombre, currency=PEN, price_minor=6700, active.
- `orders`: id UUID, user_id, sku, amount_minor, currency, provider, status, external_reference, created_at, updated_at.
- `payment_events`: proveedor, event_id/resource_id único, firma_validada, payload reducido seguro, estado procesado, timestamp; deduplicación.
- `payments`: order_id, provider_payment_id único, provider_status, amount_minor, currency, payer_reference, actualizaciones.
- `entitlements`: user_id, sku, source_order_id, active/revoked, timestamps; restricción única adecuada.
- `modules`, `lessons`, `questions`, `attempts`, `progress`: contenido, intentos y estadísticas.
- `admin_audit_logs`: actor, acción, recurso, fecha, contexto no sensible.
- `manual_payment_reviews` solo si se habilita Yape directo: referencia, estado, revisor, método de verificación independiente y trazabilidad.

Sembrar únicamente el SKU `MSV-FUN-001` y su precio S/67; no confiar en datos del navegador para hacer descuentos o conceder acceso.

## 5. Pago seguro con Mercado Pago: flujo no negociable

1. Alumno inicia sesión o se registra antes de comprar, para asociar la compra a una identidad estable.
2. Click «Comprar por S/67» llama POST autenticado `/api/checkout/mercadopago`.
3. Backend valida sesión, consulta SKU y precio en D1; crea orden local `pending` con referencia externa aleatoria.
4. Backend crea la preferencia u orden de Checkout Pro mediante API oficial usando **Access Token secreto del servidor** y clave de idempotencia cuando corresponda. Envía S/67 PEN exactos, identificador propio y URLs de retorno oficiales.
5. Frontend redirige a `init_point` o `checkout_url` entregado por Mercado Pago; **nunca expone token privado**.
6. URLs `success`, `failure`, `pending` solamente muestran un estado informativo. **Jamás conceden el derecho de acceso**.
7. Endpoint `/api/webhooks/mercadopago` verifica firma `x-signature`, identificador de solicitud, timestamp/tolerancia según documentación de la variante elegida y URL exacta. Rechaza firmas inválidas; limita cuerpos y evita filtraciones.
8. En lugar de confiar en el cuerpo del webhook, consulta a Mercado Pago por servidor el recurso notificado con token de vendedor. Confirma: estado realmente aprobado, importe S/67, moneda PEN, receptor correcto, `external_reference` que corresponde a orden interna y que el pago no esté ya procesado. No confundir `authorized`, `in_process`, `pending` con `approved`.
9. Procesa eventos de forma idempotente y transaccional: cambio de orden, registro de pago y `entitlement` solo una vez. Eventos duplicados/fuera de orden no duplican accesos ni revertirán indebidamente estados.
10. Actualiza pagos reembolsados, contracargos y fraude con política explícita de revocación y auditoría; verificar los eventos disponibles para el checkout seleccionado.
11. Si el webhook llega tarde o falla, activar reconciliación segura desde backend con API y reintentos; interfaz «Estamos verificando el pago» y soporte.
12. Pruebas obligatorias: éxito, pendiente, rechazo, cancelación, duplicado, firma falsa, precio modificado en cliente, pago de otro vendedor, otro SKU, devolución, webhook antes/después del retorno, timeout de API.

**Importante:** no confundir 67.00 PEN con 6700 PEN. D1 debe usar enteros de unidad mínima; API de proveedor recibe el importe en la unidad que su contrato especifica. No codificar precios en el navegador como autoridad.

## 6. Yape: decisión por etapas

### Fase 1 (preferida para MVP)

- Investigar desde la consola oficial de Mercado Pago qué métodos disponibles muestra Checkout Pro en la cuenta del propietario, sin prometer que Yape aparecerá automáticamente.
- Si el propietario **requiere Yape visible como método** y Checkout Pro no lo proporciona, evaluar la documentación oficial de Yape mediante Checkout API (captura de celular y OTP, tokenización y procesamiento) como integración específica, antes de publicar el botón.
- Cumplir los requisitos de la API sin recolectar o conservar OTP en D1, logs, analytics ni mensajes.

### Alternativa temporal: Yape directo con verificación manual

- Mostrar únicamente datos/QR oficialmente autorizados por el propietario.
- Crear orden local `awaiting_manual_review` con número de referencia, importe S/67 y vigencia.
- Si se permite adjuntar constancia, tratarla solo como evidencia auxiliar, susceptible de falsificación.
- Admin confirma **en la fuente receptora auténtica** que el dinero ingresó, que corresponde a la orden, importe y fecha correctos y que no se aprobó antes; luego concede el acceso con auditoría.
- Mostrar claramente que este método **no entrega acceso automático** y plazo de verificación definido por el propietario.
- Prohibido usar scraping de cuentas financieras o soluciones no autorizadas para simular una API Yape.

## 7. Seguridad obligatoria (criterio de lanzamiento)

- Repositorio privado y permisos mínimos; GitHub 2FA, Cloudflare 2FA, Mercado Pago 2FA.
- Variables secretas de Cloudflare: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, secreto de sesión/proveedor auth, `TURNSTILE_SECRET_KEY`, credenciales de correo si aplica. No publicar en cliente ni en GitHub.
- Configurar origen permitido, CSP razonable, HSTS en producción, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, cookies seguras, validación de entradas y escape seguro de salidas.
- Autorización en **cada endpoint**, comprobando `user_id` y `entitlement`; usuario A no debe ver progreso/pagos de B (probar IDOR).
- CORS explícito y mínimo; no usar `*` junto con credenciales.
- Protección CSRF cuando las cookies autentican operaciones que mutan datos.
- Consultas SQL parametrizadas; validación de esquemas; evitar inyecciones, XSS, SSRF, open redirects y subida de archivos ejecutables.
- Rate limiting en login, registro, compra, verificación de pagos, recuperación de cuenta, ejercicios y endpoints administrativos; cuidado de no bloquear webhooks legítimos.
- Turnstile con verificación obligatoria en servidor y protección complementaria, no reemplazo de rate limit.
- Verificación HMAC y comprobación de recurso para webhooks; logs sin secretos, OTP, tarjetas, datos financieros ni URLs firmadas sensibles.
- R2 privado para recursos premium; tokens breves, permisos limitados; no exponer respuestas correctas antes de contestar.
- Políticas de respaldo y restauración de D1, migraciones reversibles cuando proceda, monitoreo, alertas, bitácora de incidentes y procedimiento de revocación/rotación.
- Revisión de dependencias, lockfile, auditoría de seguridad, tests automáticos y revisión humana antes de producción.
- Respeto a privacidad y derechos del consumidor peruanos: preparar textos legales para revisión del propietario/profesional, tratamiento mínimo de datos, política de reembolsos acorde a normativa, y verificar obligaciones fiscales/comprobantes; no inventar RUC ni razón social.

## 8. UX: recorrido requerido

**Visitante**: ve propuesta, muestra del entrenador, temario, S/67, preguntas frecuentes, términos y CTA.  
**Registro**: inicia sesión sin fricción, verifica email si corresponde.  
**Compra**: orden local → checkout Mercado Pago → vuelta a página de resultado informativa.  
**Confirmación**: servidor recibe y valida evento o consulta reconciliación → entitlement.  
**Alumno**: dashboard → M1 → explicación breve → ejercicios → feedback → progreso → siguiente lección.  
**Administrador**: inspecciona órdenes y accesos; no puede editar pago arbitrariamente sin registro de auditoría.  
**Soporte**: rutas para problemas de pago, acceso y solicitud de reembolso.

## 9. Fases de ejecución y entregables

### Fase 0 — Auditoría del entorno (sin tocar producción)
- Inspeccionar repo, dominios disponibles, cuentas y límites Cloudflare, Mercado Pago y GitHub en sesión del propietario.
- Confirmar arquitectura y plan real de hosting; verificar precios, cuotas y disponibilidad regional de servicios.
- Crear `docs/architecture.md` y registro de decisiones; listar datos faltantes bajo `PENDING_OWNER`.
- **Salida:** inventario y plan de cambios aprobado.

### Fase 1 — Base del proyecto
- Crear repositorio privado y estructura de carpetas; TypeScript, linter, formateador, test runner y GitHub Actions.
- Preparar D1 con migraciones y seeds de desarrollo; Worker `/api/health`.
- Configurar preview/staging sin credenciales de producción.
- **Salida:** CI verde y URL de preview funcional.

### Fase 2 — Oferta pública
- Landing completa, móvil, rápida, accesible, términos y políticas en borrador, CTA de compra inactivo en producción hasta fase de pagos.
- **Salida:** página revisada con S/67 correcto y contenido sin promesas falsas.

### Fase 3 — Cuentas y protección
- Login/registro, sesiones, roles, dashboard y autorización de contenidos.
- Pruebas negativas de acceso cruzado y sesión caducada.
- **Salida:** área de alumno protegida y auditoría básica.

### Fase 4 — Pagos Mercado Pago
- Implementar checkout oficial, webhook firmado, reconciliación, idempotencia, permisos.
- Ejecutar todos los escenarios de pruebas de pagos. Nunca habilitar acceso solo por URL de retorno.
- **Salida:** compra simulada → activación de entitlement → acceso; fallos no activan.

### Fase 5 — Entrenador matemático
- Cargar módulos/temario; editor estructurado o archivos de contenido versionados.
- Implementar al menos un ejercicio demo y uno premium por tipo soportado, con corrección y registro de progreso.
- Incorporar videos solo si ya existen; usar placeholders claramente identificados en staging, jamás afirmar que las lecciones están grabadas.
- **Salida:** recorrido de aprendizaje completo en staging.

### Fase 6 — Yape
- Inspeccionar método habilitado por Mercado Pago y elegir integración compatible. Si no es viable en el momento, habilitar Yape directo **solo con revisión manual** y autorización del propietario.
- **Salida:** método probado sin falsas confirmaciones automáticas.

### Fase 7 — Fortalecimiento y producción
- Revisar amenazas, seguridad, dependencias, pruebas móviles/e2e, backups, seguridad de webhooks, privacidad, logs, rollback.
- Configurar dominio propio, DNS/TLS, Cloudflare y webhook real desde consola con intervención del propietario.
- Ejecutar prueba controlada solo tras aprobación y documentar resultados.
- **Salida:** checklist GO/NO-GO firmado por propietario antes de publicar compra en vivo.

## 10. Pruebas mínimas de aceptación

- Precio siempre S/67; manipular precio en devtools no cambia el cobro.
- Una sesión no puede acceder a compra/curso/progreso de otro usuario.
- Un `success?status=approved` falso no libera contenido.
- Webhook con firma inválida → rechazo y cero derechos.
- Webhook duplicado o repetido → un único derecho de acceso.
- Pago pendiente/rechazado → no acceso.
- Pago aprobado de orden distinta, moneda distinta, importe distinto o receptor distinto → no acceso.
- Contracargo/reembolso → manejo documentado, auditable y consistente.
- Credenciales no aparecen en JS compilado, commits, logs ni HTML.
- Recursos premium no son públicamente enumerables; links de entrega son limitados.
- Usuario sin compra solo puede ver demo gratuita.
- Preguntas y autocorrección operan adecuadamente, sin exponer solución en payload público.
- Vista móvil, teclado y lectores de pantalla básicos funcionan.
- Staging y producción tienen credenciales separadas; pipeline y rollback probados.
- Los textos «compra disponible», «curso completo», «Yape automático» solo se muestran si esas características funcionan realmente.

## 11. Gestión del agente con control del navegador

**Procedimiento:**
1. Crear lista viva de tareas con estado `TODO/DOING/DONE/BLOCKED`.
2. Inspeccionar el proyecto antes de reemplazar nada; documentar hallazgos.
3. Implementar por hitos; correr tests localmente, desplegar a staging y comprobar en navegador antes de siguiente hito.
4. Navegar por servicios solo en sesiones autorizadas. Para logins, 2FA, cambios de facturación, claves y producción, pausar la acción concreta para intervención del propietario; continuar después de obtener acceso autorizado.
5. Para cada cambio significativo entregar: archivos tocados, comandos ejecutados, evidencia de prueba, URL staging, riesgos pendientes, siguiente tarea.
6. No pegar credenciales, tokens, PII ni respuestas sensibles en el chat. No cambiar configuraciones financieras ni conceder permisos amplios sin confirmación del propietario.
7. Mantener un changelog y un `docs/deployment.md` reproducible. Si no tienes herramientas efectivas de navegador/escritura, no afirmar que las tienes: proporcionar instrucciones y parches concretos.
8. No concluir «listo» hasta pasar criterios de aceptación; reportar claramente lo construido y lo pendiente.

## 12. Información que el propietario facilitará mediante interfaces seguras

- Repositorio/cuenta GitHub donde trabajar y permiso adecuado.
- Cuenta Cloudflare, zona DNS/dominio elegido y permiso para crear Workers, Pages, D1, R2, Turnstile.
- Cuenta de vendedor Mercado Pago Perú habilitada y aplicación de desarrollador; introducción privada de las credenciales directamente en Cloudflare.
- Preferencia sobre Yape: integrada por Mercado Pago o cobro directo con revisión manual mientras se valida integración.
- Nombre legal/comercial del vendedor, correo de soporte, políticas revisadas, condiciones fiscales y de reembolso.
- Identidad gráfica disponible, fotos y contenido audiovisual existente; guiones y ejercicios originales.
- Dirección de correo o proveedor para autenticación/notificaciones.

No pedir todos estos datos al inicio: avanzar con placeholders no sensibles y solicitar cada intervención solo cuando sea necesaria.

## 13. Fuera de alcance v1

- Marketplace multi-instructor, 20 cursos simultáneos, afiliados, suscripciones, comisiones de terceros, IA generativa de preguntas en vivo, app móvil nativa, CRM grande, integración con Udemy, sistema tributario a medida, clases en directo y gamificación avanzada.
- Funciones matemáticas avanzadas no pertinentes a los resultados prometidos.
- Proteger perfectamente los videos contra grabación de pantalla: técnicamente no es garantizable.

## 14. Documentación técnica oficial a consultar antes de implementar

- Git integration Cloudflare Pages: https://developers.cloudflare.com/pages/configuration/git-integration/
- Cloudflare D1: https://developers.cloudflare.com/d1/get-started/
- Cloudflare Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare Turnstile y validación backend: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Cloudflare R2 signed URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Cloudflare WAF/rate limiting: https://developers.cloudflare.com/waf/rate-limiting-rules/best-practices/
- Mercado Pago Checkout Pro (Preferences): https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-preferences/overview
- Mercado Pago creación de preferencias: https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-preferences/create-payment-preference
- Mercado Pago Webhooks Checkout Pro: https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-preferences/payment-notifications
- Mercado Pago Checkout Pro Orders (si se elige esta variante): https://www.mercadopago.com.pe/developers/es/docs/checkout-pro-orders/create-order
- Mercado Pago Yape Checkout API: https://www.mercadopago.com.pe/developers/es/docs/checkout-api-orders/payment-integration/websites/yape?scope=prod

## 15. PROMPT PARA COPIAR EN CHATGPT DESKTOP / WORK

> Actúa como mi ingeniero de software principal y ejecutor técnico. Adjunto el documento `MSV-FUN-001-PLAN-MAESTRO-IMPLEMENTACION.md`: léelo completo y trátalo como la especificación principal. Vamos a lanzar la primera oferta de Matemáticas sin Vergüenza, **Funciones desde Cero para la Universidad**, a **S/67**, con página de ventas, registro/login, plataforma interactiva, Cloudflare, GitHub, cobro por Mercado Pago y una opción de Yape segura y realista.
>
> Primero inspecciona las herramientas y accesos que tienes, además del repositorio y la configuración existente. Crea un backlog por fases; empieza a ejecutar la Fase 0 y la Fase 1, sin volver a hacer investigación comercial ni redefinir el producto. Si dispones de navegador/control del equipo, úsalo cuando esté autorizado; no finjas acciones. Para credenciales, 2FA, decisiones de facturación y activación de pagos reales, solicita mi intervención en los formularios seguros y no pidas secretos en el chat. Implementa con código, pruebas, despliegue a staging y evidencia comprobable. No permitas que una URL de retorno o captura de Yape concedan acceso: solo un pago verificado en backend. Al acabar cada fase, dime qué está realmente hecho, qué pruebas pasaron, qué falta y continúa con la siguiente fase autorizada.

---

**Criterio rector:** antes de escalar, hacer que una compra legítima de S/67 habilite de forma segura un entrenamiento de Funciones realmente utilizable; que ningún pago falso lo haga, y que el propietario pueda operar el sistema sin depender del agente.
