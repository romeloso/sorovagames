import { choice, order, packSubject, type SubjectLessonSpec, type SubjectWorldSpec } from '@/data/subjects/pack'

function lesson(
  title: string,
  objective: string,
  skill: string,
  instructions: string,
  items: SubjectLessonSpec['items'],
): SubjectLessonSpec {
  return { title, objective, skill, instructions, items }
}

const worlds: SubjectWorldSpec[] = [
  {
    id: 'tech-digital',
    title: 'Mi mundo digital',
    subtitle: 'Dispositivos, partes y usos cotidianos',
    icon: '💻',
    lessons: [
      lesson('Reconoce el dispositivo', 'Distinguir computadora, tableta, teclado, ratón y pantalla.', 'tech-dispositivo', 'Mira el dibujo y elige el nombre.', [
        choice('¿Qué es esto? 💻', 'COMPUTADORA', ['COMPUTADORA', 'TECLADO', 'RATÓN'], { image: '💻', speak: 'computadora' }),
        choice('¿Qué es esto? ⌨️', 'TECLADO', ['TECLADO', 'PANTALLA', 'TABLETA'], { image: '⌨️', speak: 'teclado' }),
        choice('¿Qué es esto? 🖱️', 'RATÓN', ['RATÓN', 'TECLADO', 'COMPUTADORA'], { image: '🖱️', speak: 'ratón' }),
        choice('¿Qué es esto? 📱', 'TABLETA', ['TABLETA', 'PANTALLA DE ESCRITORIO', 'IMPRESORA'], { image: '📱', speak: 'tableta' }),
      ]),
      lesson('¿Para qué sirve?', 'Relacionar cada parte con su función.', 'tech-funcion', 'La función es lo que hace, no solo el nombre.', [
        choice('El teclado sirve para…', 'ESCRIBIR', ['ESCRIBIR', 'VER VIDEOS SOLO', 'CARGAR LA BATERÍA']),
        choice('La pantalla sirve para…', 'VER LO QUE HACE EL EQUIPO', ['VER LO QUE HACE EL EQUIPO', 'ESCRIBIR LETRAS', 'MOVER EL CURSOR']),
        choice('El ratón sirve para…', 'SEÑALAR Y ELEGIR', ['SEÑALAR Y ELEGIR', 'HABLAR POR TELÉFONO', 'IMPRIMIR']),
        choice('Una tableta se usa sobre todo…', 'TOCANDO LA PANTALLA', ['TOCANDO LA PANTALLA', 'CON UN CABLE DE LUZ', 'COMO UNA CALCULADORA DE PAPEL']),
      ]),
      lesson('Partes de la computadora', 'Señalar teclado, pantalla y ratón en un conjunto.', 'tech-dispositivo', 'Cada parte tiene un trabajo distinto.', [
        choice('¿Con qué escribes una letra?', 'CON EL TECLADO', ['CON EL TECLADO', 'CON LA PANTALLA', 'CON EL CABLE']),
        choice('¿Dónde aparece el dibujo que haces?', 'EN LA PANTALLA', ['EN LA PANTALLA', 'DENTRO DEL RATÓN', 'EN EL ENCHUFE']),
        choice('¿Qué mueves sobre la mesa para señalar?', 'EL RATÓN', ['EL RATÓN', 'LA PANTALLA', 'EL TECLADO']),
        choice('¿Cuál no es una parte para usar la computadora?', 'UN TENEDOR', ['UN TENEDOR', 'EL TECLADO', 'LA PANTALLA']),
      ]),
      lesson('Usos cotidianos', 'Elegir un uso adecuado de un dispositivo.', 'tech-uso', 'La tecnología ayuda a hacer una tarea.', [
        choice('Para llamar a la familia se puede usar…', 'UN TELÉFONO', ['UN TELÉFONO', 'UN LÁPIZ SOLO', 'UN VASO']),
        choice('Para ver una foto guardada se usa…', 'UNA PANTALLA', ['UNA PANTALLA', 'UN BORRADOR', 'UNA REGLA']),
        choice('Para escribir un cuento en la computadora usas…', 'EL TECLADO', ['EL TECLADO', 'EL MICRÓFONO SOLO', 'LA IMPRESORA APAGADA']),
        choice('¿Cuál es un uso cotidiano de una tableta?', 'LEER UN CUENTO', ['LEER UN CUENTO', 'COCINAR SOPA', 'REGAR LAS PLANTAS']),
      ]),
      lesson('Cuida el equipo', 'Tratar los dispositivos con cuidado.', 'tech-cuidado', 'Cuidar el equipo también es parte de usarlo.', [
        choice('Si se cae la tableta, puede…', 'ROMPERSE', ['ROMPERSE', 'CRECER', 'CONVERTIRSE EN LIBRO']),
        choice('Las manos con comida cerca del teclado…', 'LO ENSUCIAN', ['LO ENSUCIAN', 'LO HACEN MÁS RÁPIDO', 'CAMBIAN LAS LETRAS SOLAS']),
        choice('Cuando terminas, conviene…', 'AVISAR A UN ADULTO PARA APAGAR', ['AVISAR A UN ADULTO PARA APAGAR', 'DEJARLO EN EL SUELO', 'TAPAR LA PANTALLA CON AGUA']),
        choice('Un cable suelto se…', 'DEJA EN SU LUGAR Y SE AVISA', ['DEJA EN SU LUGAR Y SE AVISA', 'JALA PARA PROBAR', 'SE USA COMO CUERDA']),
      ]),
    ],
  },
  {
    id: 'tech-robot',
    title: 'El robot de las instrucciones',
    subtitle: 'Direcciones y secuencias',
    icon: '🤖',
    lessons: [
      lesson('Arriba y abajo', 'Elegir la dirección vertical correcta.', 'tech-direccion', 'Arriba sube. Abajo baja.', [
        choice('El robot está abajo y la estrella está arriba. ¿Qué orden das?', 'ARRIBA', ['ARRIBA', 'ABAJO', 'ESPERAR'], { speak: 'arriba' }),
        choice('La flor está debajo del robot. ¿Qué orden das?', 'ABAJO', ['ABAJO', 'ARRIBA', 'GIRAR'], { speak: 'abajo' }),
        choice('Para subir un escalón, el comando es…', 'ARRIBA', ['ARRIBA', 'ATRÁS', 'IZQUIERDA']),
        choice('Para bajar del escalón, el comando es…', 'ABAJO', ['ABAJO', 'ADELANTE DOS VECES', 'DERECHA']),
      ]),
      lesson('Izquierda y derecha', 'Elegir el lado correcto.', 'tech-direccion', 'Imagina que miras hacia la misma dirección que el robot.', [
        choice('La manzana está a la derecha. ¿Qué orden das?', 'DERECHA', ['DERECHA', 'IZQUIERDA', 'ABAJO'], { speak: 'derecha' }),
        choice('El libro está a la izquierda. ¿Qué orden das?', 'IZQUIERDA', ['IZQUIERDA', 'DERECHA', 'ARRIBA'], { speak: 'izquierda' }),
        choice('Si ya giraste a la derecha y necesitas el otro lado, eliges…', 'IZQUIERDA', ['IZQUIERDA', 'DERECHA OTRA VEZ', 'ESPERAR']),
        choice('¿Cuál no cambia de lado?', 'ESPERAR', ['ESPERAR', 'IZQUIERDA', 'DERECHA']),
      ]),
      lesson('Adelante y atrás', 'Avanzar o retroceder un paso.', 'tech-direccion', 'Adelante se acerca a lo que está enfrente.', [
        choice('La meta está enfrente. ¿Qué orden das?', 'ADELANTE', ['ADELANTE', 'ATRÁS', 'ARRIBA'], { speak: 'adelante' }),
        choice('Te pasaste y debes volver un paso. ¿Qué orden das?', 'ATRÁS', ['ATRÁS', 'ADELANTE', 'DERECHA'], { speak: 'atrás' }),
        choice('Dos pasos hacia la meta: primero…', 'ADELANTE', ['ADELANTE', 'ATRÁS', 'GIRAR SIN MOVER']),
        choice('Si das ATRÁS, te…', 'ALEJAS DE LO QUE TENÍAS ENFRENTE', ['ALEJAS DE LO QUE TENÍAS ENFRENTE', 'SUBES', 'CAMBIAS DE COLOR']),
      ]),
      lesson('Una secuencia corta', 'Elegir dos comandos en el orden correcto.', 'tech-secuencia', 'El orden cambia el camino.', [
        choice('Primero un paso al frente y luego a la derecha. ¿Qué secuencia es?', 'ADELANTE, DERECHA', ['ADELANTE, DERECHA', 'DERECHA, ADELANTE', 'ATRÁS, IZQUIERDA']),
        choice('Primero abajo y después adelante. ¿Qué secuencia es?', 'ABAJO, ADELANTE', ['ABAJO, ADELANTE', 'ADELANTE, ABAJO', 'ARRIBA, ATRÁS']),
        choice('Si inviertes ADELANTE y DESPUÉS DERECHA, el robot…', 'LLEGA A OTRO LUGAR', ['LLEGA A OTRO LUGAR', 'HACE LO MISMO', 'SE APAGA']),
        choice('Una secuencia es…', 'VARIOS COMANDOS EN ORDEN', ['VARIOS COMANDOS EN ORDEN', 'UN SOLO COLOR', 'EL NOMBRE DEL ROBOT']),
      ]),
      lesson('Guía al robot', 'Ordenar los comandos de un recorrido.', 'tech-secuencia', 'Toca los comandos en el orden del camino.', [
        order('Ordena: primero adelante y luego derecha.', ['DERECHA', 'ADELANTE'], 'ADELANTE DERECHA'),
        order('Ordena: primero izquierda y luego adelante.', ['ADELANTE', 'IZQUIERDA'], 'IZQUIERDA ADELANTE'),
        order('Ordena: arriba y después adelante.', ['ADELANTE', 'ARRIBA'], 'ARRIBA ADELANTE'),
        order('Ordena tres pasos: adelante, adelante, derecha.', ['DERECHA', 'ADELANTE', 'ADELANTE'], 'ADELANTE ADELANTE DERECHA'),
      ]),
    ],
  },
  {
    id: 'tech-patrones',
    title: 'El laboratorio de los patrones',
    subtitle: 'Reglas, repeticiones y clasificación',
    icon: '🔁',
    lessons: [
      lesson('Completa la secuencia', 'Continuar una serie de comandos.', 'tech-patron', 'Mira qué comando se repite.', [
        choice('ADELANTE, ESPERAR, ADELANTE, ESPERAR, ¿qué sigue?', 'ADELANTE', ['ADELANTE', 'ESPERAR', 'ATRÁS']),
        choice('🔴 🔵 🔴 🔵 ¿qué color sigue?', '🔴', ['🔴', '🔵', '🟢']),
        choice('1, 2, 1, 2, ¿qué número sigue?', '1', ['1', '2', '3']),
        choice('IZQUIERDA, DERECHA, IZQUIERDA, ¿qué sigue?', 'DERECHA', ['DERECHA', 'IZQUIERDA', 'ARRIBA']),
      ]),
      lesson('Encuentra la regla', 'Decir la regla de un patrón.', 'tech-patron', 'La regla explica por qué sigue ese elemento.', [
        choice('ADELANTE, ADELANTE, ESPERAR, ADELANTE, ADELANTE, ESPERAR. La regla es…', 'DOS ADELANTE Y UNA ESPERA', ['DOS ADELANTE Y UNA ESPERA', 'SOLO ESPERAR', 'UN COLOR DISTINTO']),
        choice('⭐ 🌙 ⭐ 🌙. La regla es…', 'SE ALTERNAN ESTRELLA Y LUNA', ['SE ALTERNAN ESTRELLA Y LUNA', 'SIEMPRE HAY TRES LUNAS', 'NO HAY REGLA']),
        choice('2, 4, 6, 8. La regla es…', 'SUMAR 2', ['SUMAR 2', 'RESTAR 1', 'REPETIR EL 2']),
        choice('Si la regla es «rojo, azul», después de rojo va…', 'AZUL', ['AZUL', 'ROJO OTRA VEZ SIEMPRE', 'VERDE']),
      ]),
      lesson('Clasifica', 'Agrupar comandos o dispositivos por su tipo.', 'tech-clasificar', 'Los que sirven para lo mismo van juntos.', [
        choice('¿Cuál es un comando de movimiento?', 'ADELANTE', ['ADELANTE', 'COMPUTADORA', 'PANTALLA']),
        choice('¿Cuál es un dispositivo?', 'TABLETA', ['TABLETA', 'DERECHA', 'REPETIR']),
        choice('¿Cuál no es una dirección?', 'TECLADO', ['TECLADO', 'IZQUIERDA', 'ARRIBA']),
        choice('ESPERAR se parece más a…', 'UNA PAUSA', ['UNA PAUSA', 'UN ANIMAL', 'UNA SUMA']),
      ]),
      lesson('Repite el patrón', 'Contar cuántas veces se repite un comando.', 'tech-bucle', 'Repetir es hacer lo mismo otra vez.', [
        choice('ADELANTE ADELANTE ADELANTE. ¿Cuántas veces avanza?', '3', ['3', '2', '4']),
        choice('Si REPETIR 2 significa hacerlo dos veces, REPETIR 2 ADELANTE avanza…', '2 PASOS', ['2 PASOS', '1 PASO', '4 PASOS']),
        choice('⭐ ⭐ 🌙 ⭐ ⭐ 🌙. ¿Cuántas estrellas hay en cada grupo?', '2', ['2', '1', '3']),
        choice('Repetir un comando sirve para…', 'NO ESCRIBIRLO TANTAS VECES', ['NO ESCRIBIRLO TANTAS VECES', 'BORRAR EL CAMINO', 'APAGAR EL ROBOT']),
      ]),
      lesson('¿Qué se repite?', 'Señalar el trozo que forma el patrón.', 'tech-patron', 'El patrón es la parte que vuelve a empezar.', [
        choice('AB AB AB. ¿Qué se repite?', 'AB', ['AB', 'AA', 'BA']),
        choice('🔴🔵 🔴🔵 🔴🔵. ¿Qué se repite?', '🔴🔵', ['🔴🔵', '🔵🔴🔵', '🔴🔴']),
        choice('ADELANTE ESPERAR, ADELANTE ESPERAR. ¿Qué se repite?', 'ADELANTE ESPERAR', ['ADELANTE ESPERAR', 'ESPERAR ESPERAR', 'SOLO ATRÁS']),
        choice('Si el patrón se rompe, el siguiente elemento…', 'NO SIGUE LA REGLA', ['NO SIGUE LA REGLA', 'SIEMPRE ES CORRECTO', 'BORRA LOS ANTERIORES']),
      ]),
    ],
  },
  {
    id: 'tech-programa',
    title: 'Los pequeños programadores',
    subtitle: 'Algoritmos, eventos y condiciones',
    icon: '🧩',
    lessons: [
      lesson('Ordena los pasos', 'Poner instrucciones cotidianas en orden.', 'tech-algoritmo', 'Un algoritmo es una lista de pasos en orden.', [
        order('Ordena lavarse las manos.', ['enjuagar', 'jabón', 'abrir el agua'], 'abrir el agua jabón enjuagar'),
        order('Ordena preparar el cuaderno.', ['escribir', 'abrir', 'sentarse'], 'sentarse abrir escribir'),
        order('Ordena encender con ayuda.', ['pedir ayuda', 'mirar la pantalla', 'tocar el botón'], 'pedir ayuda tocar el botón mirar la pantalla'),
        choice('Si cambias el orden de los pasos, el resultado…', 'PUEDE SER OTRO', ['PUEDE SER OTRO', 'SIEMPRE ES IGUAL', 'DESAPARECE EL PROBLEMA']),
      ]),
      lesson('Arrastra el comando', 'Elegir el comando que falta en un algoritmo.', 'tech-algoritmo', 'Cada hueco pide un comando concreto.', [
        choice('Para llegar a la meta que está enfrente falta…', 'ADELANTE', ['ADELANTE', 'ESPERAR PARA SIEMPRE', 'APAGAR']),
        choice('El robot debe girar al lado de la estrella. Falta…', 'DERECHA', ['DERECHA', 'ABAJO DEL TODO', 'BORRAR']),
        choice('Después de moverse, debe parar. Falta…', 'ESPERAR', ['ESPERAR', 'ADELANTE SIN PARAR', 'IZQUIERDA']),
        choice('Un algoritmo necesita…', 'PASOS CLAROS', ['PASOS CLAROS', 'SOLO UN DIBUJO BONITO', 'UNA CONTRASEÑA']),
      ]),
      lesson('Eventos', 'Entender que algo ocurre cuando pasa un suceso.', 'tech-evento', 'Un evento es la señal que inicia la acción.', [
        choice('«Cuando tocas la estrella, suena una nota». El evento es…', 'TOCAR LA ESTRELLA', ['TOCAR LA ESTRELLA', 'LA NOTA', 'EL COLOR DEL FONDO']),
        choice('«Al presionar iniciar, el robot camina». El evento es…', 'PRESIONAR INICIAR', ['PRESIONAR INICIAR', 'CAMINAR', 'EL NOMBRE DEL ROBOT']),
        choice('Si nadie toca el botón, la acción…', 'NO EMPIEZA', ['NO EMPIEZA', 'OCURRE SOLA SIEMPRE', 'BORRA EL PROGRAMA']),
        choice('Un evento no es…', 'EL RESULTADO FINAL', ['EL RESULTADO FINAL', 'UN TOQUE', 'PULSAR INICIAR']),
      ]),
      lesson('Un bucle sencillo', 'Predecir qué hace REPETIR.', 'tech-bucle', 'El bucle repite los comandos de adentro.', [
        choice('REPETIR 3 [ADELANTE]. ¿Cuántos pasos da?', '3', ['3', '1', '6']),
        choice('REPETIR 2 [DERECHA]. ¿Cuántos giros a la derecha hace?', '2', ['2', '1', '4']),
        choice('¿Qué ahorra un bucle?', 'ESCRIBIR EL MISMO COMANDO MUCHAS VECES', ['ESCRIBIR EL MISMO COMANDO MUCHAS VECES', 'APAGAR LA PANTALLA', 'SALTARSE LA META']),
        choice('REPETIR 2 [ADELANTE, ESPERAR] hace…', 'AVANZAR, ESPERAR, AVANZAR, ESPERAR', ['AVANZAR, ESPERAR, AVANZAR, ESPERAR', 'SOLO AVANZAR UNA VEZ', 'ESPERAR SIN MOVERSE']),
      ]),
      lesson('Si… entonces', 'Elegir la acción de una condición simple.', 'tech-condicion', 'La condición decide qué camino seguir.', [
        choice('SI hay un muro, ENTONCES…', 'GIRAR', ['GIRAR', 'SEGUIR DE FRENTE', 'APAGAR LA LUZ DE CASA']),
        choice('SI la estrella es roja, ENTONCES toca la nota. La estrella es roja. ¿Qué pasa?', 'SUENA LA NOTA', ['SUENA LA NOTA', 'NO PASA NADA', 'SE BORRA LA ESTRELLA']),
        choice('SI está lloviendo, ENTONCES llevar capa. No llueve. ¿Llevas la capa por esta regla?', 'NO', ['NO', 'SÍ', 'SIEMPRE']),
        choice('Una condición es…', 'UNA PREGUNTA QUE PUEDE SER SÍ O NO', ['UNA PREGUNTA QUE PUEDE SER SÍ O NO', 'UN COLOR FIJO', 'EL NOMBRE DE UN ARCHIVO']),
      ]),
    ],
  },
  {
    id: 'tech-depurar',
    title: 'La misión de depuración',
    subtitle: 'Encontrar y corregir errores',
    icon: '🔍',
    lessons: [
      lesson('Encuentra el error', 'Señalar el paso que no corresponde.', 'tech-depurar', 'Depurar es buscar qué instrucción falla.', [
        choice('Camino a la derecha: ADELANTE, IZQUIERDA, ADELANTE. ¿Qué sobra o está mal?', 'IZQUIERDA', ['IZQUIERDA', 'ADELANTE', 'NINGUNO']),
        choice('Para subir: ARRIBA, ABAJO, ARRIBA. ¿Cuál deshace el camino?', 'ABAJO', ['ABAJO', 'ARRIBA', 'NINGUNO']),
        choice('Contar hasta 3: 1, 2, 5. ¿Qué número está mal?', '5', ['5', '1', '2']),
        choice('Un error en un programa es…', 'UNA INSTRUCCIÓN QUE NO HACE LO QUE QUERÍAS', ['UNA INSTRUCCIÓN QUE NO HACE LO QUE QUERÍAS', 'UN DIBUJO BONITO', 'UNA PANTALLA ENCENDIDA']),
      ]),
      lesson('Instrucción incorrecta', 'Cambiar el comando equivocado.', 'tech-depurar', 'Corregir es sustituir el paso que falla.', [
        choice('Querías DERECHA y escribiste IZQUIERDA. ¿Qué pones?', 'DERECHA', ['DERECHA', 'IZQUIERDA', 'ESPERAR']),
        choice('El robot debe avanzar y pusiste ATRÁS. Lo cambias por…', 'ADELANTE', ['ADELANTE', 'ATRÁS', 'APAGAR']),
        choice('REPETIR 2 debía ser REPETIR 3. ¿Qué número corrige el bucle?', '3', ['3', '2', '1']),
        choice('Si no cambias el error, el robot…', 'REPITE EL MISMO FALLO', ['REPITE EL MISMO FALLO', 'LO ADIVINA SOLO', 'BORRA EL CAMINO']),
      ]),
      lesson('Corrige la secuencia', 'Reordenar pasos que están cruzados.', 'tech-depurar', 'A veces todos los comandos sirven, pero el orden no.', [
        order('El orden correcto es adelante y luego derecha.', ['DERECHA', 'ADELANTE'], 'ADELANTE DERECHA'),
        order('Primero pedir ayuda y luego tocar el botón.', ['tocar el botón', 'pedir ayuda'], 'pedir ayuda tocar el botón'),
        order('Primero mirar, después elegir.', ['elegir', 'mirar'], 'mirar elegir'),
        choice('Dos soluciones distintas pueden…', 'LLEGAR A LA MISMA META', ['LLEGAR A LA MISMA META', 'SER IMPOSIBLES LAS DOS', 'BORRAR EL PROBLEMA']),
      ]),
      lesson('Otra solución', 'Aceptar un camino diferente que también llega.', 'tech-depurar', 'No hay una sola forma si el resultado es el correcto.', [
        choice('Para ir a la derecha puedes girar a la derecha o…', 'GIRAR TRES VECES A LA IZQUIERDA', ['GIRAR TRES VECES A LA IZQUIERDA', 'QUEDARTE QUIETO', 'BAJAR']),
        choice('2 + 2 y 3 + 1…', 'DAN EL MISMO RESULTADO', ['DAN EL MISMO RESULTADO', 'SON IMPOSIBLES', 'NO SON NÚMEROS']),
        choice('ADELANTE ADELANTE y REPETIR 2 [ADELANTE]…', 'HACEN LO MISMO', ['HACEN LO MISMO', 'VAN EN SENTIDO OPUESTO', 'APAGAN EL ROBOT']),
        choice('Elegir otra solución válida es…', 'RESOLVER EL PROBLEMA DE OTRO MODO', ['RESOLVER EL PROBLEMA DE OTRO MODO', 'COMETER UN ERROR', 'SALTARSE LA META']),
      ]),
      lesson('El laberinto lógico', 'Elegir la secuencia que evita el obstáculo.', 'tech-depurar', 'Si hay un muro enfrente, no sirve seguir de frente.', [
        choice('Muro enfrente y camino libre a la derecha. ¿Qué haces?', 'DERECHA Y LUEGO ADELANTE', ['DERECHA Y LUEGO ADELANTE', 'ADELANTE CONTRA EL MURO', 'ATRÁS Y APAGAR']),
        choice('El camino correcto de tres pasos es adelante, derecha, adelante. ¿Cuál es?', 'ADELANTE, DERECHA, ADELANTE', ['ADELANTE, DERECHA, ADELANTE', 'DERECHA, ATRÁS, IZQUIERDA', 'ESPERAR, ESPERAR, ESPERAR']),
        choice('Si chocas con el muro, el siguiente paso útil es…', 'CAMBIAR DE DIRECCIÓN', ['CAMBIAR DE DIRECCIÓN', 'REPETIR EL CHOQUE', 'CERRAR LOS OJOS']),
        choice('Depurar el laberinto significa…', 'PROBAR, VER EL ERROR Y CORREGIR', ['PROBAR, VER EL ERROR Y CORREGIR', 'MEMORIZAR EL NOMBRE DEL MURO', 'SALTARSE LAS INSTRUCCIONES']),
      ]),
    ],
  },
  {
    id: 'tech-proyecto',
    title: 'Mi primer proyecto digital',
    subtitle: 'Historias, animaciones y seguridad',
    icon: '🎬',
    lessons: [
      lesson('Crea una historia', 'Ordenar el inicio, el medio y el final.', 'tech-proyecto', 'Una historia digital también tiene orden.', [
        order('Ordena el cuento del robot.', ['llega a la estrella', 'el robot sale', 'da dos pasos'], 'el robot sale da dos pasos llega a la estrella'),
        choice('El inicio de una historia suele presentar…', 'QUIÉN PARTICIPA', ['QUIÉN PARTICIPA', 'SOLO EL FINAL', 'LA CONTRASEÑA']),
        choice('El final muestra…', 'CÓMO TERMINA', ['CÓMO TERMINA', 'EL PRIMER PASO', 'UN ERROR A PROPÓSITO']),
        choice('Si el final queda antes del inicio, la historia…', 'SE ENTIENDE MENOS', ['SE ENTIENDE MENOS', 'ES MÁS CLARA', 'SE PROGRAMA SOLA']),
      ]),
      lesson('Construye una animación', 'Elegir el orden en que se mueve un dibujo.', 'tech-proyecto', 'Cada comando cambia lo que se ve.', [
        choice('Para que el gato avance y luego salte, eliges…', 'ADELANTE Y LUEGO SALTAR', ['ADELANTE Y LUEGO SALTAR', 'SALTAR Y QUEDARSE ATRÁS', 'SOLO ESPERAR']),
        choice('ESPERAR en una animación sirve para…', 'HACER UNA PAUSA', ['HACER UNA PAUSA', 'BORRAR EL DIBUJO', 'CAMBIAR EL NOMBRE']),
        choice('Si pones SALTAR antes de aparecer en escena, el público…', 'NO VE EL SALTO PREPARADO', ['NO VE EL SALTO PREPARADO', 'SIEMPRE LO VE IGUAL', 'ESCUCHA UNA SUMA']),
        order('Ordena: aparecer, caminar, saludar.', ['saludar', 'aparecer', 'caminar'], 'aparecer caminar saludar'),
      ]),
      lesson('Programa el recorrido', 'Combinar imagen y comandos de un camino.', 'tech-proyecto', 'La imagen muestra la meta. Los comandos la alcanzan.', [
        choice('La 🌟 está a la derecha del robot. El primer comando útil es…', 'DERECHA', ['DERECHA', 'IZQUIERDA', 'ABAJO'], { image: '🌟' }),
        choice('Después de girar hacia la estrella, sigue…', 'ADELANTE', ['ADELANTE', 'ATRÁS', 'BORRAR LA ESTRELLA'], { image: '🌟' }),
        choice('REPETIR 2 [ADELANTE] y la meta está a dos pasos. ¿Llega?', 'SÍ', ['SÍ', 'NO', 'SOLO SI HAY UN MURO']),
        choice('Un proyecto junta…', 'IMÁGENES Y COMANDOS', ['IMÁGENES Y COMANDOS', 'SOLO UNA CONTRASEÑA', 'SOLO UN COLOR']),
      ]),
      lesson('Seguridad digital', 'Reconocer qué no se comparte y cuándo pedir ayuda.', 'tech-seguridad', 'Pedir ayuda a un adulto es parte de usar internet.', [
        choice('Una contraseña se…', 'GUARDA Y NO SE COMPARTE', ['GUARDA Y NO SE COMPARTE', 'PUBLICA EN UN JUEGO', 'SE DICE A DESCONOCIDOS']),
        choice('Si alguien en internet pide tu dirección, tú…', 'NO LA DAS Y AVISAS A UN ADULTO', ['NO LA DAS Y AVISAS A UN ADULTO', 'LA ESCRIBES COMPLETA', 'ENVÍAS UNA FOTO DE TU CASA']),
        choice('Un premio de un desconocido en internet se…', 'CONSULTA CON UN ADULTO', ['CONSULTA CON UN ADULTO', 'ACEPTA SIN CONTARLO', 'PAGA CON DATOS PERSONALES']),
        choice('En un dispositivo compartido, al terminar conviene…', 'CERRAR LA SESIÓN CON AYUDA', ['CERRAR LA SESIÓN CON AYUDA', 'DEJAR LA CUENTA ABIERTA', 'ANOTAR LA CLAVE EN LA PANTALLA']),
      ]),
      lesson('Resuelve el desafío lógico', 'Combinar secuencia, bucle y una corrección.', 'tech-algoritmo', 'Haz un paso, comprueba y sigue.', [
        choice('REPETIR 2 [ADELANTE] y luego DERECHA. ¿Cuántos avances hay antes del giro?', '2', ['2', '1', '3']),
        choice('La secuencia ADELANTE, IZQUIERDA debía ir a la derecha. Cambias IZQUIERDA por…', 'DERECHA', ['DERECHA', 'ATRÁS', 'ESPERAR']),
        choice('SI hay muro ENTONCES girar. Hay muro. ¿Qué haces?', 'GIRAR', ['GIRAR', 'SEGUIR DE FRENTE', 'PUBLICAR TU NOMBRE']),
        choice('Terminar un proyecto también incluye…', 'REVISAR SI EL RESULTADO COINCIDE CON LA IDEA', ['REVISAR SI EL RESULTADO COINCIDE CON LA IDEA', 'COMPARTIR LA CONTRASEÑA', 'SALTARSE LA PRUEBA']),
      ]),
    ],
  },
]

export const TECHNOLOGY_SKILL_TITLES: Record<string, string> = {
  'tech-dispositivo': 'Reconocer dispositivos y partes',
  'tech-funcion': 'Relacionar una parte con su función',
  'tech-uso': 'Elegir un uso cotidiano',
  'tech-cuidado': 'Cuidar el equipo',
  'tech-direccion': 'Seguir una dirección',
  'tech-secuencia': 'Ordenar una secuencia',
  'tech-patron': 'Completar un patrón',
  'tech-clasificar': 'Clasificar comandos y objetos',
  'tech-bucle': 'Entender una repetición',
  'tech-algoritmo': 'Seguir un algoritmo',
  'tech-evento': 'Reconocer un evento',
  'tech-condicion': 'Usar una condición simple',
  'tech-depurar': 'Encontrar y corregir un error',
  'tech-proyecto': 'Ordenar un proyecto',
  'tech-seguridad': 'Cuidar los datos personales',
}

export const TECHNOLOGY_PACK = packSubject('technology', worlds, TECHNOLOGY_SKILL_TITLES)
