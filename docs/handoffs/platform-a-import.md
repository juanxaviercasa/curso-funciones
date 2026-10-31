# Frente A — importación de borradores
Rama: codex/platform-admin-a
Estado: en curso
Alcance: formato JSON de hasta 20 preguntas, previsualización y guardado explícito como borradores; claves opcionales, deduplicación por fuente e ID externo. No publicar ni tocar laboratorios. Migración aditiva 0007 y API/controles administrativos propios.

## Resultado
Implementado preview/commit administrativo para lotes JSON de 1–20 preguntas. Formato documentado en docs/question-import-format.md. Preview no escribe; commit revalida y crea borradores más claves de deduplicación y auditoría en transacción. Permite clave ausente con advertencias; lote inválido no escribe. Tabla 0007 protege namespace+externalId. No detecta duplicados semánticos ni publica contenido.
Validación: npm run check aprobado con 148 pruebas, TypeScript y build; check:pages aprobado. Pruebas SQLite verifican preview sin escrituras, claves ausentes, IDs repetidos, reintento, alumno rechazado, lote inválido y rollback por fallo de auditoría.
Integración de main al frente A conservó ambos bloques CSS (administración y laboratorio). No se editaron archivos reservados a B.
Pendientes: migración 0007 en entorno objetivo, QA autenticado del formulario, persistencia remota y revisión de permisos de fuentes. No se ejecutó importación de dataset externo ni se modificaron roles. No desplegado a main. Cuenta admin elegida permanece pendiente de verificación real.
