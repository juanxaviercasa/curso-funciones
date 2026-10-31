# Importación privada de ejercicios
Requiere migración 0007 además de 0005 y cuenta admin. POST /api/admin/question-import/preview y /commit, mismo cuerpo. Preview no escribe; commit revalida. Hasta 20 registros, 300000 bytes. Nunca publica preguntas.

Ejemplo original sintético; sustituir lessonId por una lección publicada existente:

```json
{"namespace":"zenit-original-v1","items":[{"externalId":"evaluacion-001","lessonId":"l1","kind":"exact_number","prompt":"Si f(x)=x+4, calcula f(2).","options":[],"expected":"6","explanation":"Sustituye x por 2: 2+4=6.","source":"Creación original para demostración","rights":"original"}]}
```

Tipos: exact_number, multiple_choice, set (selección de una alternativa). En alternativas expected es índice textual desde 0. expected:null admite clave pendiente. rights: pending, original, authorized. Campos de texto plano, sin ejecución HTML. namespace y externalId estables: repetirlos no actualiza ni duplica una importación anterior. No se detectan duplicados semánticos ni cambios de ID. Repetidos se omiten; con filas inválidas no se guarda ninguna. Los incompletos pueden guardarse como borradores, sin publicación ni autocorrección. Las advertencias no certifican validez matemática ni permisos.

Tras importar, actualizar la lista del banco. Tabla de claves única y transacción protegen reintentos; conflicto de importación simultánea revierte el lote y se debe revisar de nuevo. No importación directa del dataset externo ni descarga desde URLs. No nuevas preguntas asociadas a lecciones aún en borrador.
