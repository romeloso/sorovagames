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
    id: 'science-seres',
    title: 'El planeta de los seres vivos',
    subtitle: 'Animales, plantas y hábitats',
    icon: '🌱',
    lessons: [
      lesson('¿Ser vivo o no?', 'Distinguir seres vivos de objetos.', 'sci-vivo', 'Un ser vivo crece, necesita alimento y se reproduce.', [
        choice('¿Cuál es un ser vivo?', 'EL GATO', ['EL GATO', 'LA SILLA', 'EL LÁPIZ']),
        choice('¿Cuál no es un ser vivo?', 'LA PIEDRA', ['LA PIEDRA', 'LA PLANTA', 'EL PEZ']),
        choice('Una semilla puede convertirse en…', 'UNA PLANTA', ['UNA PLANTA', 'UNA PIEDRA', 'UN VASO']),
        choice('Los seres vivos necesitan…', 'ALIMENTO', ['ALIMENTO', 'PANTALLAS', 'RUEDAS']),
      ]),
      lesson('¿Qué necesita esta planta?', 'Nombrar agua, luz y aire.', 'sci-planta', 'Sin luz y sin agua, la planta no prospera.', [
        choice('Para crecer, una planta necesita agua y…', 'LUZ', ['LUZ', 'UN TELEVISOR', 'UN IMÁN']),
        choice('Las hojas suelen ser…', 'VERDES', ['VERDES', 'DE METAL', 'DE VIDRIO']),
        choice('La raíz sirve sobre todo para…', 'TOMAR AGUA', ['TOMAR AGUA', 'VOLAR', 'HACER SONIDO']),
        choice('Si no riegas una planta durante mucho tiempo, es probable que…', 'SE DEBILITE', ['SE DEBILITE', 'SE CONVIERTA EN PIEDRA', 'APRENDA A NADAR']),
      ]),
      lesson('Encuentra el hábitat', 'Relacionar al animal con el lugar donde vive.', 'sci-habitat', 'El hábitat es el lugar donde consigue lo que necesita.', [
        choice('¿Dónde vive el pez?', 'EN EL AGUA', ['EN EL AGUA', 'EN EL DESIERTO SECO', 'DENTRO DE UN LIBRO']),
        choice('¿Dónde vive el pájaro que hace nido?', 'EN LOS ÁRBOLES', ['EN LOS ÁRBOLES', 'DEBAJO DEL MAR', 'EN EL HORNO']),
        choice('Un camello aguanta bien…', 'EL DESIERTO', ['EL DESIERTO', 'EL FONDO DEL MAR', 'LA NIEVE ETERNA']),
        choice('El oso polar vive donde hace…', 'MUCHO FRÍO', ['MUCHO FRÍO', 'CALOR DE DESIERTO', 'FUEGO']),
      ]),
      lesson('¿Qué come?', 'Clasificar alimentos de animales.', 'sci-alimento', 'No todos comen lo mismo.', [
        choice('La vaca come sobre todo…', 'PASTO', ['PASTO', 'PIEDRAS', 'TORNILLOS']),
        choice('Un gato doméstico come…', 'CARNE O PESCADO', ['CARNE O PESCADO', 'SOLO MADERA', 'SOLO AGUA SALADA']),
        choice('Las abejas visitan las flores para conseguir…', 'NÉCTAR', ['NÉCTAR', 'TORNILLOS', 'ARENA']),
        choice('Un animal que come plantas es…', 'HERBÍVORO', ['HERBÍVORO', 'UNA ROCA', 'UN ROBOT']),
      ]),
      lesson('Ordena el ciclo de vida', 'Ordenar el crecimiento de una planta o una mariposa.', 'sci-ciclo', 'Primero lo pequeño, después lo adulto.', [
        order('Ordena la vida de la planta.', ['flor', 'semilla', 'planta'], 'semilla planta flor'),
        order('Ordena la mariposa.', ['mariposa', 'huevo', 'oruga'], 'huevo oruga mariposa'),
        choice('El pollito sale del…', 'HUEVO', ['HUEVO', 'NIDO DE PIEDRA', 'CAPULLO DE UNA ARAÑA']),
        choice('Un bebé de rana se llama…', 'RENACUAJO', ['RENACUAJO', 'GUSANO DE SEDA', 'POLLITO']),
      ]),
    ],
  },
  {
    id: 'science-cuerpo',
    title: 'Mi cuerpo y mis sentidos',
    subtitle: 'Cuerpo, sentidos y cuidado',
    icon: '🫀',
    lessons: [
      lesson('Partes del cuerpo', 'Nombrar cabeza, tronco y extremidades.', 'sci-cuerpo', 'Señala en ti la parte si puedes.', [
        choice('¿Con qué caminas?', 'LOS PIES', ['LOS PIES', 'LAS OREJAS', 'EL PELO']),
        choice('¿Con qué miras?', 'LOS OJOS', ['LOS OJOS', 'LAS RODILLAS', 'LOS CODOS']),
        choice('El corazón está en el…', 'PECHO', ['PECHO', 'PIE', 'CODO']),
        choice('¿Con qué tomas un lápiz?', 'LAS MANOS', ['LAS MANOS', 'LAS OREJAS', 'EL TALÓN']),
      ]),
      lesson('Cinco sentidos', 'Asociar cada sentido con su órgano.', 'sci-sentido', 'Cada sentido nos da una información distinta.', [
        choice('El olor se percibe con…', 'LA NARIZ', ['LA NARIZ', 'LOS PIES', 'EL CODO']),
        choice('El sabor se percibe con…', 'LA LENGUA', ['LA LENGUA', 'LAS OREJAS', 'EL PELO']),
        choice('Un trueno se escucha con…', 'LOS OÍDOS', ['LOS OÍDOS', 'LOS OJOS', 'LA NARIZ']),
        choice('Lo suave o lo áspero se nota con…', 'EL TACTO', ['EL TACTO', 'EL GUSTO', 'LA VISTA SOLA']),
      ]),
      lesson('Hábitos saludables', 'Elegir acciones de autocuidado.', 'sci-salud', 'Cuidar el cuerpo es parte de la ciencia de todos los días.', [
        choice('Antes de comer conviene…', 'LAVARSE LAS MANOS', ['LAVARSE LAS MANOS', 'CORRER CON LOS OJOS CERRADOS', 'COMER EN EL SUELO SUCIO']),
        choice('Para descansar, el cuerpo necesita…', 'DORMIR', ['DORMIR', 'NO DORMIR NUNCA', 'SOLO DULCES']),
        choice('Beber agua ayuda a…', 'HIDRATARSE', ['HIDRATARSE', 'DEJAR DE RESPIRAR', 'PERDER LOS SENTIDOS']),
        choice('Lavarse los dientes cuida…', 'LA BOCA', ['LA BOCA', 'LAS RODILLAS', 'EL PELO SOLAMENTE']),
      ]),
      lesson('¿Qué sentido usas?', 'Elegir el sentido según la pista.', 'sci-sentido', 'A veces usas más de uno. Elige el principal.', [
        choice('Sabes que la sopa está caliente al tocarla. Usas…', 'EL TACTO', ['EL TACTO', 'EL OLFATO SOLAMENTE', 'EL GUSTO SIN TOCAR']),
        choice('Reconoces una canción. Usas…', 'EL OÍDO', ['EL OÍDO', 'EL GUSTO', 'EL TACTO']),
        choice('Ves un semáforo en rojo. Usas…', 'LA VISTA', ['LA VISTA', 'EL OLFATO', 'EL GUSTO']),
        choice('Hueles el pan recién hecho. Usas…', 'EL OLFATO', ['EL OLFATO', 'EL OÍDO', 'LA VISTA SOLA']),
      ]),
      lesson('Mi cuerpo se mueve', 'Relacionar una acción con la parte del cuerpo.', 'sci-cuerpo', 'Observa qué parte trabaja.', [
        choice('Al saltar, empujas el suelo con…', 'LAS PIERNAS', ['LAS PIERNAS', 'LAS OREJAS', 'EL PELO']),
        choice('Al respirar, entra aire por…', 'LA NARIZ O LA BOCA', ['LA NARIZ O LA BOCA', 'LOS CODOS', 'EL PELO']),
        choice('Parpadear protege…', 'LOS OJOS', ['LOS OJOS', 'LAS RODILLAS', 'LOS TALONES']),
        choice('Si te cortas, lo más cuidadoso es…', 'AVISAR A UN ADULTO', ['AVISAR A UN ADULTO', 'ESCONDERLO', 'CORRER DESCALZO']),
      ]),
    ],
  },
  {
    id: 'science-agua',
    title: 'El mundo del agua y el clima',
    subtitle: 'Estados, lluvia y tiempo',
    icon: '💧',
    lessons: [
      lesson('Estados del agua', 'Reconocer sólido, líquido y vapor en ejemplos cotidianos.', 'sci-agua', 'Esto es un modelo, no un experimento con fuego.', [
        choice('El hielo es agua en estado…', 'SÓLIDO', ['SÓLIDO', 'LÍQUIDO', 'INVISIBLE']),
        choice('El agua que bebes está en estado…', 'LÍQUIDO', ['LÍQUIDO', 'SÓLIDO', 'DE PIEDRA']),
        choice('El vapor que sale de una sopa caliente es agua que…', 'SE EVAPORA', ['SE EVAPORA', 'SE VUELVE ARENA', 'DESAPARECE PARA SIEMPRE']),
        choice('Si el hielo se deja fuera del congelador, se…', 'DERRITE', ['DERRITE', 'CONVIERTE EN MADERA', 'CONVIERTE EN METAL']),
      ]),
      lesson('Predice qué ocurrirá', 'Hacer una predicción sencilla sobre el agua.', 'sci-prediccion', 'Primero dices qué crees. Después comparas.', [
        choice('Un vaso de agua al sol, durante horas, es probable que…', 'BAJE UN POCO', ['BAJE UN POCO', 'SE VUELVA HIELO AL SOL', 'SE VUELVA JUGO SOLO']),
        choice('Una nube oscura y el cielo gris anuncian posible…', 'LLUVIA', ['LLUVIA', 'SEQUÍA INMEDIATA', 'NIEVE EN EL DESIERTO']),
        choice('El charco de la calle, al salir el sol, puede…', 'SECARSE', ['SECARSE', 'CRECER SIN PARAR', 'VOLVERSE LECHE']),
        choice('Soplar sobre tus manos mojadas las hace sentir…', 'MÁS FRESCAS', ['MÁS FRESCAS', 'MÁS SECAS AL INSTANTE SIEMPRE', 'CON MÁS AGUA']),
      ]),
      lesson('Sol, nubes y viento', 'Describir el tiempo de hoy.', 'sci-clima', 'El tiempo cambia. No es lo mismo que el clima de muchos años.', [
        choice('De día, la luz principal viene del…', 'SOL', ['SOL', 'A LA LUNA SOLA', 'DE UNA LÁMPARA OBLIGATORIA']),
        choice('El viento es…', 'AIRE EN MOVIMIENTO', ['AIRE EN MOVIMIENTO', 'AGUA SÓLIDA', 'UNA ROCA']),
        choice('Las nubes están hechas de…', 'GOTAS MUY PEQUEÑAS', ['GOTAS MUY PEQUEÑAS', 'ALGODÓN DE AZÚCAR', 'HUMO DE COLORES']),
        choice('Un día sin nubes se ve…', 'DESPEJADO', ['DESPEJADO', 'CON TORMENTA SEGURA', 'DE NOCHE A MEDIODÍA']),
      ]),
      lesson('El viaje del agua', 'Ordenar un modelo simple del ciclo.', 'sci-agua', 'Es un modelo. El agua real sigue caminos parecidos.', [
        order('Ordena el modelo.', ['lluvia', 'vapor', 'charco al sol'], 'charco al sol vapor lluvia'),
        choice('La lluvia cae desde…', 'LAS NUBES', ['LAS NUBES', 'EL CENTRO DE LA TIERRA', 'LA LUNA']),
        choice('Cuando el vapor se enfría, puede formar…', 'GOTAS', ['GOTAS', 'ARENA', 'MADERA']),
        choice('Los ríos llevan agua hacia…', 'EL MAR O UN LAGO', ['EL MAR O UN LAGO', 'EL SOL', 'EL ESPACIO']),
      ]),
      lesson('Cuidar el agua', 'Elegir acciones que no la desperdician.', 'sci-planeta', 'El agua limpia no es infinita en la llave.', [
        choice('Al lavarte los dientes, conviene…', 'CERRAR LA LLAVE', ['CERRAR LA LLAVE', 'DEJARLA ABIERTA TODO EL TIEMPO', 'USAR EL AGUA DEL INODORO PARA BEBER']),
        choice('El agua de beber debe estar…', 'LIMPIA', ['LIMPIA', 'CON TIERRA', 'CON JABÓN']),
        choice('Un charco de la calle…', 'NO SE BEBE', ['NO SE BEBE', 'ES MEJOR QUE EL AGUA FILTRADA', 'ES SIEMPRE POTABLE']),
        choice('Regar las plantas al mediodía de mucho sol hace que el agua…', 'SE EVAPORE MÁS RÁPIDO', ['SE EVAPORE MÁS RÁPIDO', 'SE CONGELE', 'SE VUELVA AZÚCAR']),
      ]),
    ],
  },
  {
    id: 'science-materiales',
    title: 'El laboratorio de los materiales',
    subtitle: 'Propiedades que se pueden observar',
    icon: '🧲',
    lessons: [
      lesson('Sólido o líquido', 'Clasificar materiales cotidianos.', 'sci-material', 'Un sólido mantiene su forma. Un líquido toma la del vaso.', [
        choice('La leche es un…', 'LÍQUIDO', ['LÍQUIDO', 'SÓLIDO DURO', 'GAS QUE SE VE']),
        choice('Una cuchara de metal es un…', 'SÓLIDO', ['SÓLIDO', 'LÍQUIDO', 'VAPOR']),
        choice('El jugo toma la forma del…', 'VASO', ['VASO', 'CUCHILLO', 'LIBRO CERRADO']),
        choice('Una galleta es un…', 'SÓLIDO', ['SÓLIDO', 'LÍQUIDO', 'IMÁN']),
      ]),
      lesson('Flota o se hunde', 'Predecir con objetos conocidos. No hace falta probar con cosas peligrosas.', 'sci-flotacion', 'Esto es una predicción, no una orden de experimentar solos.', [
        choice('Un barco de juguete hueco suele…', 'FLOTAR', ['FLOTAR', 'HUNDIRSE SIEMPRE', 'DISOLVERSE']),
        choice('Una piedra suele…', 'HUNDIRSE', ['HUNDIRSE', 'FLOTAR COMO UN GLOBO', 'EVAPORARSE']),
        choice('Un globo inflado con aire, en el agua, tiende a…', 'FLOTAR', ['FLOTAR', 'IRSE AL FONDO COMO UNA PIEDRA', 'VOLVERSE HIELO']),
        choice('Si un objeto es muy pesado para su tamaño, es más fácil que…', 'SE HUNDA', ['SE HUNDA', 'VUELE SOLO', 'DESAPAREZCA']),
      ]),
      lesson('¿Qué atrae el imán?', 'Separar materiales magnéticos de otros.', 'sci-iman', 'El imán no atrae todo. Atrae algunos metales.', [
        choice('Un clip de metal puede ser atraído por…', 'UN IMÁN', ['UN IMÁN', 'UNA PLUMA', 'UN TROZO DE TELA']),
        choice('Una hoja de papel…', 'NO LA ATRAE EL IMÁN', ['NO LA ATRAE EL IMÁN', 'SIEMPRE SE PEGA AL IMÁN', 'SE VUELVE METAL']),
        choice('¿Cuál es más probable que se pegue al imán?', 'UNA LATA DE ACERO', ['UNA LATA DE ACERO', 'UN BLOQUE DE MADERA', 'UNA PLUMA']),
        choice('El imán tiene una zona que atrae y otra que puede…', 'EMPUJAR OTRO IMÁN', ['EMPUJAR OTRO IMÁN', 'ENCENDER FUEGO', 'HERVIR AGUA']),
      ]),
      lesson('Propiedades', 'Usar palabras como suave, duro, transparente.', 'sci-material', 'Observa sin probar cosas desconocidas.', [
        choice('El vidrio de una ventana es…', 'TRANSPARENTE', ['TRANSPARENTE', 'BLANDO COMO ALGODÓN', 'LÍQUIDO']),
        choice('Una almohada es…', 'SUAVE', ['SUAVE', 'DURA COMO UNA PIEDRA', 'MAGNÉTICA SIEMPRE']),
        choice('El hielo se siente…', 'FRÍO', ['FRÍO', 'CALIENTE COMO SOPA', 'COMO ARENA SECA']),
        choice('Arrugar un papel es un cambio…', 'DE FORMA', ['DE FORMA', 'QUE LO VUELVE AGUA', 'QUE LO VUELVE IMÁN']),
      ]),
      lesson('Clasifica materiales', 'Agrupar por una propiedad.', 'sci-material', 'Una misma cosa puede mirarse de varias formas.', [
        choice('Cuchara, clip y moneda pueden agruparse como…', 'METALES', ['METALES', 'LÍQUIDOS', 'PLANTAS']),
        choice('Agua, leche y jugo son…', 'LÍQUIDOS', ['LÍQUIDOS', 'ANIMALES', 'NUBES']),
        choice('Madera y tela se parecen en que…', 'NO LAS ATRAE EL IMÁN', ['NO LAS ATRAE EL IMÁN', 'SON LÍQUIDOS', 'SON HIELO']),
        choice('Un cambio que puedes deshacer al alisar el papel es…', 'ARRUGARLO', ['ARRUGARLO', 'QUEMARLO', 'DISOLVERLO EN ÁCIDO']),
      ]),
    ],
  },
  {
    id: 'science-tierra',
    title: 'La Tierra y el espacio',
    subtitle: 'Día, noche y cuidado del planeta',
    icon: '🌍',
    lessons: [
      lesson('Día y noche', 'Relacionar la luz del Sol con el día.', 'sci-espacio', 'No mires el Sol directamente.', [
        choice('De día vemos el cielo iluminado por…', 'EL SOL', ['EL SOL', 'UNA LINTERNA OBLIGATORIA', 'EL CENTRO DE LA TIERRA']),
        choice('De noche, si el cielo está despejado, podemos ver…', 'ESTRELLAS', ['ESTRELLAS', 'EL SOL EN EL CENTRO DEL CIELO', 'NADA NUNCA']),
        choice('La Luna…', 'NO PRODUCE SU PROPIA LUZ COMO EL SOL', ['NO PRODUCE SU PROPIA LUZ COMO EL SOL', 'ES UNA NUBE', 'ES UN AVIÓN']),
        choice('Cuando en tu casa es de noche, en otro lugar del mundo puede ser…', 'DE DÍA', ['DE DÍA', 'IMPOSIBLE', 'SIEMPRE DE NOCHE']),
      ]),
      lesson('Sol, Luna y estrellas', 'Distinguir los tres.', 'sci-espacio', 'Están muy lejos. No son objetos para tocar.', [
        choice('La estrella más cercana que vemos de día es…', 'EL SOL', ['EL SOL', 'LA LUNA', 'UN SATÉLITE DE JUGUETE']),
        choice('La Luna gira alrededor de…', 'LA TIERRA', ['LA TIERRA', 'TU CASA', 'UN ÁRBOL']),
        choice('Las estrellas del cielo nocturno son…', 'SOLES MUY LEJANOS', ['SOLES MUY LEJANOS', 'LUCIÉRNAGAS PEGADAS', 'VENTANAS']),
        choice('La Tierra es…', 'UN PLANETA', ['UN PLANETA', 'UNA ESTRELLA', 'UNA NUBE']),
      ]),
      lesson('Entornos naturales', 'Nombrar bosque, mar, montaña y ciudad.', 'sci-entorno', 'Cada entorno tiene seres y materiales distintos.', [
        choice('En el mar hay sobre todo…', 'AGUA SALADA', ['AGUA SALADA', 'ARENA SECA SIN AGUA', 'NIEVE EN TODA LA SUPERFICIE']),
        choice('En un bosque hay muchos…', 'ÁRBOLES', ['ÁRBOLES', 'SEMAFOROS', 'HORNOS']),
        choice('Una montaña es un relieve…', 'ALTO', ['ALTO', 'PLANO COMO UNA HOJA', 'LÍQUIDO']),
        choice('La ciudad es un entorno hecho en gran parte por…', 'PERSONAS', ['PERSONAS', 'SOLO VOLCANES', 'SOLO PECES']),
      ]),
      lesson('Cuida el planeta', 'Elegir acciones de cuidado.', 'sci-planeta', 'Cuidar es una decisión de todos los días.', [
        choice('La basura se deja…', 'EN EL BASURERO', ['EN EL BASURERO', 'EN EL RÍO', 'EN EL NIDO DE UN AVE']),
        choice('Separar papel y plástico ayuda a…', 'RECICLAR', ['RECICLAR', 'ENSUIAR MÁS', 'APAGAR EL SOL']),
        choice('Las plantas del parque…', 'NO SE ARRANCAN POR JUEGO', ['NO SE ARRANCAN POR JUEGO', 'SE ARRANCAN TODAS', 'NO NECESITAN TIERRA']),
        choice('Ahorrar luz cuando sales de un cuarto…', 'CUIDA ENERGÍA', ['CUIDA ENERGÍA', 'NO SIRVE DE NADA NUNCA', 'APAGA LA LUNA']),
      ]),
      lesson('Recursos', 'Distinguir lo que la naturaleza nos da y hay que cuidar.', 'sci-planeta', 'Un recurso se puede agotar si se desperdicia.', [
        choice('El agua limpia es un…', 'RECURSO', ['RECURSO', 'JUGUETE INFINITO', 'TIPO DE ROCA']),
        choice('Los árboles nos dan sombra y también…', 'OXÍGENO', ['OXÍGENO', 'GASOLINA', 'VIDRIO']),
        choice('La tierra del huerto sirve para…', 'CULTIVAR', ['CULTIVAR', 'RESPIRAR BAJO EL AGUA', 'ENCENDER UN IMÁN']),
        choice('Si tiramos aceite al desagüe…', 'CONTAMINAMOS EL AGUA', ['CONTAMINAMOS EL AGUA', 'LA LIMPIAMOS', 'CREAMOS PECES']),
      ]),
    ],
  },
  {
    id: 'science-investigar',
    title: 'Los pequeños investigadores',
    subtitle: 'Preguntar, predecir y comparar',
    icon: '🔬',
    lessons: [
      lesson('Haz una pregunta', 'Distinguir una pregunta que se puede observar.', 'sci-indagar', 'Una buena pregunta se puede comprobar mirando.', [
        choice('¿Cuál se puede observar?', '¿QUÉ OBJETO FLOTA?', ['¿QUÉ OBJETO FLOTA?', '¿CUÁL ES EL COLOR FAVORITO DEL SOL?', '¿QUÉ SUEÑA UNA PIEDRA?']),
        choice('«Creo que el hielo se derrite fuera del congelador» es…', 'UNA PREDICCIÓN', ['UNA PREDICCIÓN', 'UN RESULTADO YA MEDIDO', 'UNA ORDEN']),
        choice('Mirar y anotar lo que pasa es…', 'OBSERVAR', ['OBSERVAR', 'ADIVINAR SIN MIRAR', 'CAMBIAR EL RESULTADO']),
        choice('Si tu predicción no coincide, lo científico es…', 'REVISAR LA IDEA', ['REVISAR LA IDEA', 'ESCONDER LO QUE VISTE', 'INVENTAR EL DATO']),
      ]),
      lesson('Compara resultados', 'Decir en qué se parecen y en qué no.', 'sci-comparar', 'Comparar es encontrar igualdades y diferencias.', [
        choice('Un gato y un perro se parecen en que…', 'SON ANIMALES', ['SON ANIMALES', 'TIENEN ALAS', 'SON PLANTAS']),
        choice('El hielo y el agua líquida se parecen en que…', 'SON AGUA', ['SON AGUA', 'TIENEN LA MISMA FORMA SIEMPRE', 'SON METAL']),
        choice('Día y noche se diferencian por…', 'LA LUZ DEL SOL', ['LA LUZ DEL SOL', 'EL NOMBRE DE LA CIUDAD', 'EL IDIOMA']),
        choice('Dos hojas del mismo árbol pueden…', 'NO SER IDÉNTICAS', ['NO SER IDÉNTICAS', 'SER DE PLÁSTICO', 'SER LÍQUIDOS']),
      ]),
      lesson('Causa y efecto', 'Unir una acción con lo que provoca.', 'sci-causa', 'La causa ocurre antes. El efecto, después.', [
        choice('Si empujas un vaso en la mesa, el efecto puede ser que…', 'SE MUEVA', ['SE MUEVA', 'SE VUELVA UN GATO', 'PIERDA LA GRAVEDAD']),
        choice('La causa de un charco que se seca al sol es sobre todo…', 'EL CALOR', ['EL CALOR', 'EL IMÁN', 'EL RUIDO']),
        choice('Regar una planta es la causa. Un efecto posible es que…', 'SE MANTENGA', ['SE MANTENGA', 'SE CONVIERTA EN METAL', 'DEJE DE SER PLANTA AL INSTANTE']),
        choice('Si no hay luz para una planta de sol, un efecto posible es que…', 'CREZCA MENOS', ['CREZCA MENOS', 'SE VUELVA UN PEZ', 'PRODUZCA IMÁN']),
      ]),
      lesson('El diario del científico', 'Elegir cómo registrar una observación.', 'sci-registro', 'Anotar ayuda a no olvidar lo que viste.', [
        choice('Para recordar cuántas hojas contaste, puedes…', 'ESCRIBIR EL NÚMERO', ['ESCRIBIR EL NÚMERO', 'BORRARLO', 'INVENTARLO DESPUÉS']),
        choice('Un dibujo del experimento sirve para…', 'MOSTRAR LO OBSERVADO', ['MOSTRAR LO OBSERVADO', 'CAMBIAR EL RESULTADO', 'ESCONDERLO']),
        choice('La fecha en el diario dice…', 'CUÁNDO OBSERVASTE', ['CUÁNDO OBSERVASTE', 'EL NOMBRE DEL PLANETA', 'EL PESO DEL SOL']),
        choice('Si dos personas ven lo mismo, conviene…', 'COMPARAR SUS NOTAS', ['COMPARAR SUS NOTAS', 'QUEDARSE CON EL INVENTO', 'NO HABLAR']),
      ]),
      lesson('Experimento seguro', 'Elegir una exploración sin riesgo.', 'sci-seguridad', 'No uses fuego, enchufes ni sustancias desconocidas.', [
        choice('¿Cuál es una exploración segura?', 'VER QUÉ FLOTA EN UN RECIPIENTE CON UN ADULTO', ['VER QUÉ FLOTA EN UN RECIPIENTE CON UN ADULTO', 'PROBAR UN PRODUCTO DE LIMPIEZA', 'METER UN TENEDOR EN EL ENCHUFE']),
        choice('Si algo huele muy fuerte y no sabes qué es…', 'ALEJATE Y AVISA', ['ALEJATE Y AVISA', 'LO PRUEBAS', 'LO MEZCLAS']),
        choice('Un modelo en la pantalla…', 'NO ES EL FENÓMENO REAL', ['NO ES EL FENÓMENO REAL', 'REEMPLAZA AL MUNDO REAL', 'SIEMPRE ES PELIGROSO']),
        choice('Pedir ayuda a un adulto es…', 'PARTE DE INVESTIGAR CON CUIDADO', ['PARTE DE INVESTIGAR CON CUIDADO', 'UN ERROR', 'SOLO PARA BEBÉS']),
      ]),
    ],
  },
]

export const SCIENCE_SKILL_TITLES: Record<string, string> = {
  'sci-vivo': 'Distinguir seres vivos',
  'sci-planta': 'Necesidades de las plantas',
  'sci-habitat': 'Relacionar hábitats',
  'sci-alimento': 'Relacionar alimentación',
  'sci-ciclo': 'Ordenar un ciclo de vida',
  'sci-cuerpo': 'Conocer el cuerpo',
  'sci-sentido': 'Usar los sentidos',
  'sci-salud': 'Hábitos de cuidado',
  'sci-agua': 'Estados y ciclo del agua',
  'sci-prediccion': 'Hacer una predicción',
  'sci-clima': 'Describir el tiempo',
  'sci-planeta': 'Cuidar el entorno',
  'sci-material': 'Clasificar materiales',
  'sci-flotacion': 'Predecir si flota',
  'sci-iman': 'Saber qué atrae un imán',
  'sci-espacio': 'Día, noche y astros',
  'sci-entorno': 'Nombrar entornos',
  'sci-indagar': 'Preguntar y predecir',
  'sci-comparar': 'Comparar observaciones',
  'sci-causa': 'Causa y efecto',
  'sci-registro': 'Registrar hallazgos',
  'sci-seguridad': 'Explorar con seguridad',
}

export const SCIENCE_PACK = packSubject('science', worlds, SCIENCE_SKILL_TITLES)
