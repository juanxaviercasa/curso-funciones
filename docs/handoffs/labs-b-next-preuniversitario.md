# Frente B — Laboratorios preuniversitarios, siguiente entrega

Asignación por el propietario: ampliar el nivel matemático mientras A implementa medios privados y plataforma. Crear codex/labs-preuniversitario-b desde origin/main actualizado. Publicar reserva e informe en docs/handoffs/labs-b-preuniversitario-*.md. A integra las rutas; B no edita main.tsx, account/classroom, backend, DB, estilos globales ni dependencias.

## Objetivo
Pasar de controles sueltos a exploraciones con propósito: predecir, contrastar gráfica/tabla/expresión y justificar. Orientación preuniversitaria hacia UNMSM, UNI y PUCP, sin afirmar alineación oficial ni copiar exámenes/libros sin permiso. La dificultad se fundamenta en destrezas concretas, no solo en nombres de universidades.

## Entrega inmediata y acotada
1. Inventariar en fuentes locales las familias ya implementadas en funciones y libros disponibles. Registrar archivo/página/tema/autoría/permisos; no subir libros ni claves privadas.
2. FamilyExplorerLab autónomo con selector de familias: afín, cuadrática, valor absoluto, raíz, racional 1/x, exponencial y logarítmica. Reutilizar matemática pura existente donde encaje, sin romper componentes previos. Dominio/rango, cortes, simetría, monotonía y asíntotas cuando correspondan. Comparación de f(x) con a f(b(x-h))+k, primero con controles acotados y casos matemáticamente definidos.
3. TrigonometryLab autónomo: seno, coseno y tangente; radianes, marcas en múltiplos de pi, amplitud, período y desplazamientos. Amplitud no aplicable a tangente; no unir ramas a través de polos. Distinguir b=0 y a=0 conservando el dominio de la expresión original.
4. Dos actividades originales guiadas por laboratorio: predecir antes de mover, comprobar y explicar. Claramente gratuitas y sin persistencia. No introducir respuestas premium en el bundle.

## Siguientes entregas, por separado
InverseFunctionsLab: inyectividad, prueba horizontal, restricciones de dominio, reflexión y=x, composición e inversa; distinguir arcoseno/arccoseno/arctangente de funciones recíprocas. Composición y funciones por tramos: fronteras incluidas/excluidas, discontinuidades y restricciones.
Retos originales graduados: dominio con restricciones combinadas; lectura de parámetros desde gráfica; desigualdades gráficas; composición e inversas. Proponer contrato de ejercicios privados al frente A antes de integrarlos.

## Criterios de aceptación
Matemática pura en packages/math-labs, UI/CSS prefijado en apps/web/src/labs, pruebas en tests/labs. Sin eval ni servicios externos. Muestreo segmentado, no NaN/Infinity expuestos; ventana visible no se presenta como dominio. Casos frontera, parámetros cero, log argumento <=0, exponencial base>0 distinta de1, polos tangentes/racionales, doble instancia sin IDs repetidos. SVG con descripción, tabla accesible, teclado, restaurar, móvil360px sin desbordamiento. No simplificar cancelaciones eliminando exclusiones de la expresión original.

Entregar componentes nombrados sin props, sin rutas nuevas ni dependencias. npm run check, evidencia visual real y límites. Subir rama para revisión; no fusionar main. Si el alcance completo no cabe, entregar primero FamilyExplorerLab terminado con evidencia y reservar trigonometría en el informe.
