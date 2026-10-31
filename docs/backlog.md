# Lista viva — 31 de octubre de 2026

| Fase | Estado | Evidencia y pendiente |
|---|---|---|
| 0 Auditoría | DOING | Repositorio y cuentas conectados; revisar privacidad, protecciones y cuotas antes del lanzamiento |
| 1 Base | DONE | Proyecto, D1 migraciones 0001–0004, Pages Functions y dominio publicados |
| 2 Oferta | DOING | Landing y demo publicadas; políticas y datos comerciales requieren revisión del propietario |
| 3 Identidad | DOING | Clerk conectado y sesión verificada en backend; instancia productiva y revisión antiabuso pendientes |
| 4 Mercado Pago | DOING | Orders sandbox aprobado y acceso comprobado; controles y pruebas automatizadas; validación real aprobada aún pendiente |
| 5 Entrenamiento | DOING | Cinco lecciones, seis ejercicios, progreso y resumen de intentos; videos, pistas escalonadas y ampliación del banco pendientes |
| 6 Yape | BLOCKED | Visible en checkout; autopagos rechazados. Pendiente compra legítima de otra persona y acceso verificado; continuar tareas independientes |
| 7 Lanzamiento | TODO | Revisión e2e móvil, producción Clerk, seguridad, backups, políticas y GO/NO-GO |

## Hito actual: seguimiento del aprendizaje
- Backend agrega intentos totales, respuestas correctas y ejercicios únicos resueltos filtrados por alumno.
- Panel muestra lecciones completadas y permite continuar en la primera incompleta.
- Prueba con SQLite real verifica aislamiento entre dos alumnos y que intentos repetidos no inflan ejercicios únicos resueltos.
- 115 pruebas, TypeScript y compilación aprobados. QA visual con cuenta autorizada pendiente del despliegue.

## Próximas tareas
1. Revisar experiencia privada en navegador con cuenta que tiene acceso, sin conceder acceso artificial al alumno sin compra.
2. Añadir pistas escalonadas y ampliar contenido original; preparar guiones para los videos pendientes.
3. Resolver configuración productiva de Clerk con intervención del propietario cuando corresponda.
4. Revisar operación administrativa, recuperación, límites, respaldo y criterios de lanzamiento.

## Pagos: decisión vigente del propietario
Continuar el proyecto sin repetir autopagos. No migrar de API solo para simular Yape. No afirmar validación integral de Yape ni de acceso por pago real. No habilitar venta pública automáticamente.

## Aula y editor inicial — 31 octubre 2026
- Implementados: aula de una lección a la vez, navegación, teoría/práctica y avance real; vista de muestra /vista-previa/aula con dos lecciones sintéticas y ejercicio sin persistencia.
- Editor /administrar/curso para roles admin existentes: títulos y explicaciones, sin HTML ejecutable. Auditoría atómica y conflicto concurrente 409. No se modificaron roles ni derechos de acceso.
- 117 pruebas aprobadas; QA local de navegación y ejercicio de muestra realizado. QA del editor con cuenta admin real pendiente.
- Plan y fuentes: docs/construction-plan.md. Videos, creación de módulos, edición e importación de preguntas siguen pendientes.
