INSERT INTO modules VALUES
('m1','MSV-FUN-001','Concepto y evaluación',1),('m2','MSV-FUN-001','Dominio y rango',2),('m3','MSV-FUN-001','Gráficas y transformaciones',3),('m4','MSV-FUN-001','Composición e inversas',4),('m5','MSV-FUN-001','Práctica integrada',5);
INSERT INTO lessons(id,module_id,title,body,position) VALUES
('l1','m1','Una entrada, una salida','Una función asigna exactamente una salida a cada entrada de su dominio. En f(x)=3x−2, evaluar f(5) significa sustituir x por 5: 3·5−2=13. Una misma salida puede provenir de entradas distintas; lo que no puede ocurrir es que la misma entrada tenga dos salidas diferentes.',1),
('l2','m2','Restricciones del dominio','El dominio reúne las entradas permitidas. En una fracción, el denominador no puede ser cero. En una raíz cuadrada real, el radicando debe ser mayor o igual a cero. Primero encuentra las restricciones y luego expresa el conjunto permitido.',1),
('l3','m3','Mover una gráfica','En g(x)=f(x)+k, cada salida aumenta k: la gráfica se desplaza verticalmente. En g(x)=f(x−h), el desplazamiento horizontal es h hacia la derecha. Comprueba el movimiento con puntos concretos antes de memorizar reglas.',1),
('l4','m4','Componer paso a paso','En (f∘g)(x)=f(g(x)), primero evalúa g y usa su salida como entrada de f. Si f(x)=2x+1 y g(x)=x−3, entonces f(g(x))=2(x−3)+1=2x−5. El orden puede cambiar el resultado.',1),
('l5','m5','Modelar y comprobar','Define qué representa la entrada, sus unidades y sus valores permitidos. Una tarifa C(t)=5+2t combina un costo fijo de 5 con 2 por cada unidad de t. Comprueba que la salida tenga sentido en el contexto.',1);
INSERT INTO questions(id,lesson_id,kind,prompt,options_json,private_rule_json,explanation,difficulty) VALUES
('q1','l1','multiple_choice','¿Cuál relación define una función?','["{(1,2),(1,3)}","{(1,2),(2,2)}","{(3,1),(3,4)}"]','{"expected":"1"}','En la segunda relación cada entrada tiene una única salida. Compartir salida está permitido.',1),
('q2','l1','exact_number','Si f(x)=3x−2, calcula f(−2).',NULL,'{"expected":-8}','f(−2)=3·(−2)−2=−6−2=−8.',1),
('q3','l2','set','Selecciona el dominio real de f(x)=√(x−2).','["(−∞,2]","[2,+∞)","(2,+∞)"]','{"expected":"1"}','x−2 debe ser mayor o igual a cero: x≥2. El extremo 2 sí se incluye.',2),
('q4','l3','multiple_choice','g(x)=x²+3 es la gráfica de x² desplazada…','["3 a la derecha","3 hacia arriba","3 hacia abajo"]','{"expected":"1"}','Cada salida aumenta en 3; por eso el desplazamiento es vertical hacia arriba.',1),
('q5','l4','exact_number','f(x)=2x+1 y g(x)=x−3. Calcula f(g(4)).',NULL,'{"expected":3}','g(4)=1. Luego f(1)=2·1+1=3.',2),
('q6','l5','exact_number','Una tarifa C(t)=5+2t está en soles. ¿Cuánto cuesta t=6?',NULL,'{"expected":17}','C(6)=5+2·6=17 soles.',2);
