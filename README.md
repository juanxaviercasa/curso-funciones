# Sistema Zenit · Funciones desde Cero

Producto: **Funciones desde Cero para la Universidad**. Precio fijo: **S/67.00 PEN**.

## Estado real
Base local creada desde cero. Landing adaptable, demo corregida en servidor, migración D1, bloqueo de pagos y pruebas iniciales. No es una tienda operativa. Identidad, entrenamiento y adaptador sandbox tienen código preparado; conectar y validar cuentas, Yape y despliegue siguen pendientes. No hay credenciales ni cobros reales.

## Desarrollo
Requiere Node 22+ (24 recomendado).

1. npm ci
2. npm run check
3. npm run db:migrate:local
4. npm run dev:worker

Wrangler sirve frontend compilado y API en http://127.0.0.1:8787. Para editar la interfaz con recarga automática, mantener Wrangler y ejecutar npm run dev en otra terminal.

Leer docs/backlog.md, docs/architecture.md y docs/deployment.md. El plan maestro en la raíz gobierna el alcance. No activar producción sin aprobación del propietario.

## Integraciones preparadas (aún no conectadas)
Clerk gestiona identidad; Worker verifica la sesión y correo antes de crear el usuario local. Definir VITE_CLERK_PUBLISHABLE_KEY en entorno local privado (Vite usa apps/web como raíz), y CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY y APP_ORIGIN en Worker mediante interfaces seguras. Ningún secreto debe tener prefijo VITE_. Configurar acceso por código/correo y protección antiabuso en el proveedor.
Se incluyen cinco lecciones de texto y seis preguntas premium en D1, con autocorrección y progreso. El adaptador de pagos solo admite sandbox y permanece bloqueado hasta configurar la cuenta y validar pruebas. Producción está prohibida en código.

## Marca vigente
Por instrucción del propietario, Sistema Zenit reemplaza la marca anterior. Azul profundo con acentos naranja y amarillo. El SKU MSV-FUN-001 se conserva como identificador técnico para no alterar órdenes o pruebas. El entrenamiento y precio S/67 permanecen. Dominio elegido: funcionesdesdecero.sistemazenit.com; conectado al despliegue de vista previa.

## Vista previa publicada
https://funcionesdesdecero.sistemazenit.com

Cloudflare Pages + Functions, integrado con main. Compras desactivadas. La demo funciona; el acceso privado requiere configurar identidad y base remota.
