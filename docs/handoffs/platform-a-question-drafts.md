# Frente A — banco de borradores
Rama: codex/platform-admin-a
Base: 5574b78
Estado: en curso
Alcance: API administrativa, editor privado y migración aditiva para borradores. No editar laboratorios ni dependencias raíz. No cambiar ejercicios publicados o pagos. Migración remota y QA con administrador pendientes de integración.
Archivos previstos: apps/api/src/question-drafts.ts, index.ts, apps/web/src/course-admin.tsx, question-drafts.tsx, style.css, database/migrations/0005_question_drafts.sql y pruebas propias.

## Entrega implementada
Estado: listo para revisión técnica; sin despliegue a producción.
- GET/POST /api/admin/question-drafts: solo rol admin, origen validado para mutaciones, payload acotado y consultas parametrizadas.
- Tabla separada question_drafts, migración aditiva 0005. Respuesta opcional; alternativas y números finitos validados; procedencia y permisos incluidos.
- Creación/actualización más bitácora en transacción; control de concurrencia mediante revision.
- Formulario integrado en /administrar/curso. No incluye publicación, importación masiva ni eliminación. No cambia preguntas existentes, progreso, roles o pagos.
- CSS del formulario en style.css, sin tocar ninguna carpeta del frente B.

## Validación real ejecutada
npm run check: TypeScript, 120 pruebas y build aprobados. SQLite verifica aislamiento de alumnos, ausencia de borradores en outline, clave opcional, rechazo de entradas inválidas, revisión concurrente y rollback al fallar auditoría. git diff --check aprobado. Dependencias instaladas existentes; no se cambiaron package.json ni lockfile. npm ci no se ejecutó de nuevo.

## Integración pendiente
No aplicar runtime en main antes de migración 0005 en la base objetivo. Aplicar primero en entorno de prueba, comprobar editor con cuenta admin real, probar persistencia y conflicto desde UI. No se ejecutó QA visual autenticado ni migración remota. No se concedieron roles administrativos artificiales. La tabla no publica datos al alumno; publicación requerirá un flujo separado de revisión matemática y permisos.

Frente B puede continuar su rama independiente. No necesita consumir estos endpoints ni esta tabla para entregar FunctionsLab.
