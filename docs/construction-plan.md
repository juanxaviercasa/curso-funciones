# Construcción Sistema Zenit — 31 octubre 2026

## Decisiones
Base: Cursos_Matematica, React/Vite + Worker/D1 + Clerk + Mercado Pago Orders. Adaptar patrones de navegación del aula de academia-zenit; no incorporar sus pagos Stripe ni cambiar de base de datos. Marca Sistema Zenit azul/naranja/amarillo. Mantener Funciones a S/67 y las ventas públicas cerradas.

## Etapas y aceptación
1. Aula: una lección seleccionada, módulos, zona audiovisual honesta, teoría/práctica, siguiente/anterior y avance real. Vista de diseño con datos de muestra separada de derechos de compra.
2. Editor inicial: listar y editar títulos/textos existentes. Rol admin en servidor, entradas acotadas, control de edición concurrente y auditoría en transacción. Sin asignaciones automáticas de rol.
3. Banco: inventario local, procedencia, permisos y revisión matemática, importación como borrador. Las claves incompletas no se autocorrigen. No ejecutar extractores externos en esta fase.
4. Recursos: elegir proveedor privado, revisar costos, subir videos y entregar reproducción autorizada. No usar enlaces públicos como protección.
5. Lanzamiento: QA autenticado, móvil, accesibilidad, antiabuso, backups, políticas, Clerk producción, pago legítimo de tercero y aprobación del propietario.

## Alcance de esta entrega
Etapas 1 y editor de texto de etapa 2. No incluye creación de cursos, editor de ejercicios ni carga de videos. Modelo comercial sigue limitado al SKU inicial; ampliarlo con migración revisada antes de vender otros cursos.

## Fuentes inventariadas
- academia-zenit: patrones de aula, reproductor y navegación por capítulos. Se adapta la experiencia a React/Vite; no se incorpora Mux/Stripe ni Prisma.
- profesor-matematica: laboratorios gráficos candidatos. Evaluación premium requiere reglas privadas en servidor.
- Rumbo_SanMarcos: referencia para editor de preguntas e importaciones; revisar datos de demostración y autorización antes de trasladar.
- prisma_data: estructura conceptual para teoría, ejemplos, pistas y problemas.
- estudio_uni y MathVerse: referencia visual; fuentes principalmente compiladas.
- portafolio_juancabello: perfil del docente y recursos visuales seleccionados.
- Libros: 1108 archivos PDF inventariados, no 1108 títulos distintos. Lectura interna y derechos pendientes.
- dataset_eduteka: resumen declara 14558 preguntas. Álgebra: 492 registros, 484 sin clave. Importar únicamente como borrador revisable, sin publicar preguntas incompletas para autocorrección.

## Resultado inicial
Aula conectada a GET /api/training y POST /api/attempts. Vista /vista-previa/aula con contenido sintético y ejercicio local de muestra sin persistencia. Editor /administrar/curso para roles admin existentes; GET /api/admin/lessons y POST /api/admin/lessons/:id. Sin nuevas migraciones ni concesiones de rol. Edición del texto visible actual, no publicación de borradores. Conflictos concurrentes devuelven 409. Auditoría y actualización atómicas.
