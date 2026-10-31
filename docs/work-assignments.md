# Asignación de trabajo entre laptops

Estado: distribución propuesta por el coordinador y publicada por instrucción del propietario. La otra laptop debe leerla y confirmar su adopción en su entrega antes de implementar. Git no impide ediciones simultáneas: esta distribución es un acuerdo de trabajo.

## Frente A — esta laptop: plataforma e integración
Identificación: dispone de Cursos_Matematica, academia-zenit, profesor-matematica, prisma_data, Rumbo_SanMarcos, Libros y dataset_eduteka.
Responsabilidad: aula, editor administrativo, API, permisos, datos persistentes, importador, videos privados, pagos, despliegue y revisión de integración.
Archivos reservados: apps/api/**; apps/web/src/account.tsx, classroom.tsx, course-admin.tsx, main.tsx, style.css; database/**; functions/**; packages/shared/**; packages/math-engine/**; configuraciones raíz, package.json y lockfile; .github/**.
Tareas siguientes: mejorar editor y gestión de contenido; diseñar borradores para banco de preguntas; revisar fuentes disponibles aquí; conectar el laboratorio recibido sin alterar pagos o derechos.
Rama siguiente: codex/platform-admin-a. Entrega propia: docs/handoffs/platform-a-*.md.

## Frente B — otra laptop: laboratorios y recursos locales
Identificación: dispone de funciones (el propietario confirma que corresponde a funciones.sistemazenit.com) y api_reverse con catálogos y 199 PDF inventariados.
Responsabilidad: extraer matemática pura, adaptar una gráfica interactiva y preparar inventario de recursos de esa máquina. No necesita esperar al editor administrativo.
Archivos reservados: apps/web/src/labs/**; packages/math-labs/**; tests/labs/**; scripts/source-b/**; docs/handoffs/labs-b-*.md; docs/sources/pc-b/**.
Primera tarea: adaptar una muestra de función lineal con controles accesibles y gráfica segmentada cuando corresponda. Después ampliar familias con pruebas de dominio, parámetros cero y valores no finitos.
Rama: codex/labs-functions-b, creada desde origin/main actualizado. Mantener codex/local-sources-handoff como entrega histórica del informe.
No editar main.tsx, classroom.tsx, style.css, backend, migraciones, pagos, autenticación ni configuración raíz. Si hacen falta dependencias o cambios de contrato, anotarlos para el frente A; no modificar package.json por cuenta propia.

## Contrato inicial del laboratorio
- Exportar un componente React nombrado FunctionsLab desde apps/web/src/labs/FunctionsLab.tsx. Debe poder renderizarse sin props, sin login ni servicios externos.
- CSS propio importado por el componente, con clases que comiencen por zenit-lab-. No estilos globales para body, button, input ni etiquetas genéricas.
- Utilidades matemáticas puras en packages/math-labs; sin Supabase, Clerk, Stripe, Mux, ventanas globales al importar ni acceso a bases.
- Primera entrega sin nuevas dependencias: React, TypeScript, SVG y CSS disponibles en el proyecto. Imports relativos, sin alias exclusivos de Next.js.
- Demostración gratuita sin persistencia: no modifica progreso, no concede acceso y no introduce claves premium en frontend.
- Reglas y respuestas de ejercicios premium se entregan aparte como propuesta privada; su implementación corresponde al backend del frente A.
- El frente A añade la ruta y conecta el componente después de revisar la rama. El frente B no necesita editar el punto de entrada para entregar su módulo.

## Recursos educativos
Cada máquina aporta un resumen reproducible de sus propios archivos. No copiar libros, bases, sesiones, cachés ni secretos al repositorio. Registrar fuente, tema, formato, permisos y revisión; sin permiso confirmado no publicar materiales completos. Los datos incompletos quedan como borradores y no se usan para autocorrección.

## Procedimiento de coordinación
1. Antes de trabajar: fetch, leer este archivo y entregas recientes; crear rama propia desde main actualizado.
2. Publicar una entrega en su ruta asignada con tarea, archivos previstos, dependencias y estado en curso. Subir la rama para que sea visible.
3. Mantener cambios dentro del frente. Solicitar coordinación si otro frente necesita la misma ruta; no borrar ni reescribir su trabajo.
4. Al terminar: npm run check para código, diff --check, evidencia real y límites. Publicar commit y rama; no afirmar validación no ejecutada.
5. Integración a cargo del frente A: revisar diff, resolver conflictos con conocimiento de ambas entregas, probar y fusionar. main despliega automáticamente.
6. El siguiente agente de cada laptop debe leer AGENTS.md y este archivo; el chat no sustituye los documentos versionados.

## Aceptación inmediata
Informe de B integrado como contexto. No se afirma que sus laboratorios ya hayan sido portados. A mantiene el aula y backend actuales; B puede entregar FunctionsLab sin tocar las rutas de A. Próximo punto de coordinación: revisión de esa primera entrega y su conexión al aula.

## Nueva tarea B
Después de la entrega lineal 7b3e25f, desarrollar QuadraticLab conforme a docs/handoffs/labs-b-next-quadratic.md. B confirma inicio en su propia entrega. A mantiene las rutas de integración.

## Siguiente tarea tras QuadraticLab
B: laboratorio de dominio/rango de raíz cuadrada. Ver docs/handoffs/labs-b-next-domain.md. A conserva integración y administración.
