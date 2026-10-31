# Sistema Zenit · Funciones desde Cero

Producto: **Funciones desde Cero para la Universidad**. Precio fijo: **S/67.00 PEN**.

## Estado real — 31 de octubre de 2026
Sitio desplegado en Cloudflare Pages con dominio propio, D1 y autenticación Clerk conectados. Compra sandbox aprobada con acceso concedido tras notificación firmada. Checkout Pro Orders y webhook real separados del sandbox. Venta pública cerrada; compra real restringida a la cuenta de validación autorizada.

Yape aparece en checkout como invitado. Los intentos del propietario fueron rechazados por seguridad; según lo comunicado por el propietario tras hablar con soporte, no se permiten autopagos. Yape queda pendiente de una compra legítima de otra persona y de verificar el acceso resultante. No se considera validado de extremo a extremo.

Cinco lecciones de texto y seis ejercicios privados con autocorrección y progreso. Resumen de lecciones, ejercicios resueltos e intentos por alumno y enlace para continuar. Videos pendientes. Clerk aún usa instancia de desarrollo. No es un lanzamiento comercial completo.

## Desarrollo
Requiere Node 22+ (24 recomendado).

1. npm ci
2. npm run check
3. npm run db:migrate:local
4. npm run dev:worker

Wrangler sirve frontend compilado y API en http://127.0.0.1:8787. Para editar la interfaz con recarga automática, mantener Wrangler y ejecutar npm run dev en otra terminal.

Leer docs/backlog.md, docs/architecture.md y docs/deployment.md. El plan maestro en la raíz gobierna el alcance. No activar producción sin aprobación del propietario.

## Integraciones
Clerk verifica sesión y correo en servidor. Configurar secretos solo mediante interfaces seguras; ningún secreto debe tener prefijo VITE_. Revisar docs/backlog.md y docs/production-payment-validation.md antes de cambiar pagos o entornos.

## Marca vigente
Por instrucción del propietario, Sistema Zenit reemplaza la marca anterior. Azul profundo con acentos naranja y amarillo. El SKU MSV-FUN-001 se conserva como identificador técnico para no alterar órdenes o pruebas. El entrenamiento y precio S/67 permanecen. Dominio elegido: funcionesdesdecero.sistemazenit.com; conectado al despliegue de vista previa.

## Vista previa publicada
https://funcionesdesdecero.sistemazenit.com

Cloudflare Pages + Functions, integrado con main. Compras públicas desactivadas. Demo funcional y área privada conectada. El curso requiere un derecho de acceso validado en servidor.
