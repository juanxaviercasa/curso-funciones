# Lista viva

| Fase | Estado | Entregable / requisito pendiente |
|---|---|---|
| 0 Auditoría | DOING | Inventario local y decisiones DONE; cuentas, privacidad GitHub, cuotas y hosting TODO |
| 1 Base | DOING | Estructura, CI y migración creadas; validar checks y D1 local; preview remoto TODO |
| 2 Oferta | DOING | Landing y muestra implementadas; QA navegador TODO; políticas son borradores |
| 3 Identidad | TODO | Seleccionar y configurar proveedor; sesión, roles, CSRF, Turnstile, límites y pruebas IDOR |
| 4 Mercado Pago | TODO | Preferencia, firma, consulta autenticada, atomicidad, conciliación y matriz de pruebas |
| 5 Entrenamiento | TODO | Contenido original, preguntas premium, progreso, administración y videos |
| 6 Yape | TODO | Inspeccionar disponibilidad y validar integración o revisión manual autorizada |
| 7 Lanzamiento | TODO | Endurecimiento, staging, e2e, políticas revisadas, backups, GO/NO-GO del propietario |

No se considera una fase completa mientras falte su evidencia externa obligatoria.

## Avance adicional
- Código de identidad Clerk, panel, autorización y consulta administrativa: implementado, pendiente configuración y pruebas con sesiones reales.
- Adaptador sandbox de Preferences y webhook transaccional: implementado, pendiente matriz D1/concurrencia y prueba integrada con proveedor.
- Cinco lecciones originales de texto y seis ejercicios privados en D1; tres tipos (elección, numérico exacto, conjunto por selección). Videos y pistas escalonadas pendientes.
- Conciliación, Turnstile/rate limit, R2, panel de revisión Yape, CI remoto y despliegue siguen TODO.
