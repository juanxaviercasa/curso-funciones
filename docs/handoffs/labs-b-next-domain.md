# Siguiente tarea B: dominio y rango de raíz cuadrada
Estado: asignación preparada por A; B debe confirmar inicio.
Base: main actualizado con QuadraticLab integrado (o origin/codex/labs-quadratic-b si aún no llegó la integración). Crear rama codex/labs-domain-b. No mezclar migraciones de platform-admin-a.

## Alcance
Componente RootDomainLab sin props en apps/web/src/labs/RootDomainLab.tsx. Explorar f(x)=a√(x-h)+k, con controles acotados y teclado. Mostrar dominio [h,+∞), extremo (h,k), rango [k,+∞) si a>0, (-∞,k] si a<0 y {k} si a=0. Mantener el dominio original x≥h incluso si a=0. Entradas x<h no tienen valor real. No unir gráfica fuera de dominio. Tabla de entradas válidas y al menos una inválida rotulada sin valor real; no presentar NaN/Infinity al alumno.

## Archivos
Nuevo componente y CSS con prefijo zenit-lab-root-domain-. Matemática pura en packages/math-labs/root-domain.ts; pruebas nuevas en tests/labs/root-domain*. No modificar componentes previos, index del muestreador, rutas, estilos globales, backend, pagos, identidad ni dependencias raíz. A conecta la ruta tras revisión.

## Aceptación
Pruebas frontera x=h, x<h, signos y cero de a, h/k negativos, no finitos, dominio frente a ventana visible. SVG descriptivo, texto, tabla, restauración, IDs únicos para dos instancias y teclado. npm run check y QA móvil 360px sin desbordamiento. Gratuito sin persistencia ni respuestas premium. Entrega propia docs/handoffs/labs-b-domain-*.md con commit, evidencia y límites. Subir reserva de tarea al comenzar. No fusión directa a main.
