import { choice, order, packSubject, type SubjectLessonSpec, type SubjectWorldSpec } from '@/data/subjects/pack'

function around(n: number) {
  const values = [n - 1, n, n + 1].map((value) => Math.max(0, value))
  const unique = [...new Set(values)]
  while (unique.length < 3) unique.push((unique[unique.length - 1] ?? 0) + 1)
  return unique.map(String)
}

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
    id: 'math-numeros',
    title: 'El valle de los números',
    subtitle: 'Contar, comparar y reconocer cantidades',
    icon: '🔢',
    lessons: [
      lesson('Reconoce el número', 'Asociar el símbolo con su nombre.', 'math-numero', 'Mira el número y elige.', [
        choice('¿Qué número es?  4', '4', around(4), { speak: 'cuatro' }),
        choice('¿Qué número es?  7', '7', around(7), { speak: 'siete' }),
        choice('¿Qué número es?  2', '2', around(2), { speak: 'dos' }),
        choice('¿Qué número es?  9', '9', around(9), { speak: 'nueve' }),
      ]),
      lesson('Cuenta los animales', 'Contar objetos de uno en uno.', 'math-contar', 'Cuenta sin saltarte ninguno.', [
        choice('¿Cuántos gatos hay? 🐱🐱🐱', '3', around(3), { image: '🐱' }),
        choice('¿Cuántos patos hay? 🦆🦆🦆🦆🦆', '5', around(5), { image: '🦆' }),
        choice('¿Cuántas tortugas hay? 🐢🐢', '2', around(2), { image: '🐢' }),
        choice('¿Cuántos peces hay? 🐟🐟🐟🐟🐟🐟', '6', around(6), { image: '🐟' }),
      ]),
      lesson('Más y menos', 'Comparar dos cantidades.', 'math-comparar', 'Más significa una cantidad mayor.', [
        choice('¿Dónde hay más? 🍎🍎🍎🍎  o  🍎🍎', '4 MANZANAS', ['4 MANZANAS', '2 MANZANAS', 'IGUALES']),
        choice('¿Dónde hay menos? 🐶🐶🐶  o  🐶', '1 PERRO', ['1 PERRO', '3 PERROS', 'IGUALES']),
        choice('Estos grupos: ⭐⭐⭐ y ⭐⭐⭐', 'IGUALES', ['IGUALES', 'EL PRIMERO TIENE MÁS', 'EL SEGUNDO TIENE MÁS']),
        choice('¿Qué número es mayor, 8 o 3?', '8', ['8', '3', 'SON IGUALES']),
      ]),
      lesson('Antes y después', 'Encontrar el anterior y el posterior.', 'math-secuencia', 'La recta numérica sigue un orden.', [
        choice('¿Qué número va después del 6?', '7', around(7)),
        choice('¿Qué número va antes del 4?', '3', around(3)),
        choice('¿Qué número está entre 5 y 7?', '6', around(6)),
        choice('¿Qué número va después del 9?', '10', ['10', '8', '11']),
      ]),
      lesson('El cero y el diez', 'Incluir el cero y llegar hasta diez.', 'math-numero', 'Cero significa que no hay ninguno.', [
        choice('No hay globos. ¿Cuántos hay?', '0', ['0', '1', '2']),
        choice('¿Cuántos dedos hay en las dos manos? ✋✋', '10', ['10', '8', '5'], { image: '✋' }),
        choice('¿Qué es menos, 0 o 1?', '0', ['0', '1', 'SON IGUALES']),
        choice('Cuenta: 🌸🌸🌸🌸🌸🌸🌸🌸', '8', around(8)),
      ]),
    ],
  },
  {
    id: 'math-patrones',
    title: 'La fábrica de patrones',
    subtitle: 'Secuencias, formas y regularidades',
    icon: '🔶',
    lessons: [
      lesson('Completa el color', 'Continuar un patrón de colores.', 'math-patron', 'Mira lo que se repite.', [
        choice('🔴 🔵 🔴 🔵 ¿Qué sigue?', '🔴', ['🔴', '🔵', '🟢']),
        choice('🟡 🟡 🟢 🟡 🟡 ¿Qué sigue?', '🟢', ['🟢', '🟡', '🔴']),
        choice('🟣 🟠 🟣 🟠 🟣 ¿Qué sigue?', '🟠', ['🟠', '🟣', '🔵']),
        choice('⚪ ⚫ ⚫ ⚪ ⚫ ⚫ ¿Qué sigue?', '⚪', ['⚪', '⚫', '🔴']),
      ]),
      lesson('Completa la forma', 'Continuar un patrón de figuras.', 'math-patron', 'La forma también puede repetirse.', [
        choice('⬜ 🔺 ⬜ 🔺 ¿Qué sigue?', '⬜', ['⬜', '🔺', '⚪']),
        choice('⭐ ⭐ 🌙 ⭐ ⭐ ¿Qué sigue?', '🌙', ['🌙', '⭐', '☀️']),
        choice('⬛ ⬛ ⬜ ⬛ ⬛ ¿Qué sigue?', '⬜', ['⬜', '⬛', '🔺']),
        choice('🔴 🔴 🔵 🔴 🔴 🔵 ¿Qué sigue?', '🔴', ['🔴', '🔵', '🟢']),
      ]),
      lesson('Patrón numérico', 'Encontrar la regla de una serie.', 'math-patron', 'Cuenta de cuánto en cuánto crece.', [
        choice('2, 4, 6, 8, ¿qué sigue?', '10', ['10', '9', '12'], { hint: 'Suma 2 cada vez.' }),
        choice('1, 2, 3, 4, ¿qué sigue?', '5', ['5', '6', '3']),
        choice('5, 4, 3, 2, ¿qué sigue?', '1', ['1', '0', '6'], { hint: 'La serie baja de uno en uno.' }),
        choice('10, 20, 30, ¿qué sigue?', '40', ['40', '31', '50']),
      ]),
      lesson('Ordena los números', 'Poner cantidades de menor a mayor.', 'math-orden', 'Empieza por el más pequeño.', [
        order('Ordena de menor a mayor.', ['3', '1', '2'], '1 2 3'),
        order('Ordena de menor a mayor.', ['8', '5', '6'], '5 6 8'),
        order('Ordena de menor a mayor.', ['4', '9', '1'], '1 4 9'),
        order('Ordena de menor a mayor.', ['7', '2', '10'], '2 7 10'),
      ]),
      lesson('¿Cuál no pertenece?', 'Encontrar el elemento que rompe la regla.', 'math-patron', 'Busca el que es diferente.', [
        choice('🔴 🔴 🔵 🔴. ¿Cuál sobra si el patrón es rojo?', '🔵', ['🔵', '🔴', 'NINGUNO']),
        choice('2, 4, 5, 6. ¿Cuál no es par?', '5', ['5', '2', '6']),
        choice('🔺 🔺 ⬜ 🔺. ¿Cuál no es triángulo?', '⬜', ['⬜', '🔺', 'NINGUNO']),
        choice('🐱 🐱 🚗 🐱. ¿Cuál no es un animal?', '🚗', ['🚗', '🐱', 'NINGUNO']),
      ]),
    ],
  },
  {
    id: 'math-sumas',
    title: 'El laboratorio de las sumas',
    subtitle: 'Unir cantidades y usar el signo más',
    icon: '➕',
    lessons: [
      lesson('Suma con objetos', 'Juntar dos grupos y contar el total.', 'math-suma', 'Primero mira los objetos. Después cuenta.', [
        choice('🍎🍎 + 🍎 = ¿cuántas?', '3', around(3), { hint: 'Dos y una más.' }),
        choice('🐟🐟🐟 + 🐟🐟 = ¿cuántos?', '5', around(5)),
        choice('⭐⭐⭐⭐ + ⭐ = ¿cuántas?', '5', around(5)),
        choice('🌼 + 🌼🌼 = ¿cuántas?', '3', around(3)),
      ]),
      lesson('El signo más', 'Leer una suma escrita con números.', 'math-suma', 'El + junta. El = pregunta el total.', [
        choice('2 + 3 = ?', '5', around(5)),
        choice('4 + 1 = ?', '5', around(5)),
        choice('6 + 2 = ?', '8', around(8)),
        choice('3 + 3 = ?', '6', around(6)),
      ]),
      lesson('Sumas un poco mayores', 'Sumar sin pasar de 12.', 'math-suma', 'Puedes contar hacia adelante.', [
        choice('7 + 2 = ?', '9', around(9)),
        choice('5 + 4 = ?', '9', around(9)),
        choice('8 + 3 = ?', '11', ['11', '10', '12']),
        choice('6 + 4 = ?', '10', ['10', '9', '11']),
      ]),
      lesson('Suma cero', 'Comprender que sumar cero no cambia la cantidad.', 'math-suma', 'Cero es ningún objeto más.', [
        choice('4 + 0 = ?', '4', around(4)),
        choice('0 + 7 = ?', '7', around(7)),
        choice('9 + 0 = ?', '9', around(9)),
        choice('3 + 0 = ?', '3', around(3)),
      ]),
      lesson('Inventa el total', 'Elegir la suma que representa una historia.', 'math-suma', 'Lee la historia y junta las cantidades.', [
        choice('Luma tiene 2 globos y le regalan 3. ¿Cuántos tiene?', '5', around(5)),
        choice('En la mesa hay 4 tazas y traen 2 más. ¿Cuántas hay?', '6', around(6)),
        choice('Un niño ve 1 pájaro y luego 6 más. ¿Cuántos vio?', '7', around(7)),
        choice('Hay 5 lápices rojos y 5 azules. ¿Cuántos hay en total?', '10', ['10', '5', '9']),
      ]),
    ],
  },
  {
    id: 'math-restas',
    title: 'El bosque de las restas',
    subtitle: 'Quitar, comparar y encontrar la diferencia',
    icon: '➖',
    lessons: [
      lesson('Quita objetos', 'Ver qué queda después de quitar.', 'math-resta', 'Tapa los que se van y cuenta los demás.', [
        choice('🍎🍎🍎🍎🍎 se comen 2. ¿Cuántas quedan?', '3', around(3)),
        choice('🎈🎈🎈🎈 se va 1. ¿Cuántos quedan?', '3', around(3)),
        choice('🍪🍪🍪🍪🍪🍪 se comen 3. ¿Cuántas quedan?', '3', around(3)),
        choice('⭐⭐⭐ se apaga 0. ¿Cuántas siguen?', '3', around(3)),
      ]),
      lesson('El signo menos', 'Leer una resta.', 'math-resta', 'El − quita. No es lo mismo que sumar.', [
        choice('5 − 2 = ?', '3', around(3)),
        choice('8 − 1 = ?', '7', around(7)),
        choice('6 − 4 = ?', '2', around(2)),
        choice('9 − 3 = ?', '6', around(6)),
      ]),
      lesson('Restar hasta cero', 'Llegar a no quedar ninguno.', 'math-resta', 'Si quitas todos, queda cero.', [
        choice('4 − 4 = ?', '0', ['0', '1', '4']),
        choice('2 − 2 = ?', '0', ['0', '2', '1']),
        choice('7 − 0 = ?', '7', around(7), { hint: 'No quitaste ninguno.' }),
        choice('10 − 10 = ?', '0', ['0', '10', '1']),
      ]),
      lesson('¿Suma o resta?', 'Elegir la operación de una historia.', 'math-operacion', 'Regalar o irse es quitar. Recibir es juntar.', [
        choice('Tenías 6 galletas y regalaste 2. ¿Qué haces?', 'RESTAR', ['RESTAR', 'SUMAR', 'NO CAMBIA']),
        choice('Tenías 3 flores y te dan 2. ¿Qué haces?', 'SUMAR', ['SUMAR', 'RESTAR', 'NO CAMBIA']),
        choice('Había 5 pájaros y se van 5. ¿Cuántos quedan?', '0', ['0', '5', '10']),
        choice('Había 4 sillas y llegan 4 personas más, una por silla. ¿Alcanzan?', 'SÍ', ['SÍ', 'NO', 'SOBRAN 4']),
      ]),
      lesson('Diferencia', 'Comparar y decir cuántos más hay.', 'math-resta', 'La diferencia es lo que le falta al grupo pequeño.', [
        choice('Hay 7 libros y 4 lápices. ¿Cuántos libros hay de más?', '3', around(3)),
        choice('Ana tiene 9 años y su hermano 6. ¿Cuántos años le lleva?', '3', around(3)),
        choice('Una caja tiene 8 y otra 5. ¿Cuál es la diferencia?', '3', around(3)),
        choice('Ves 10 estrellas y 6 nubes. ¿Cuántas estrellas hay de más?', '4', around(4)),
      ]),
    ],
  },
  {
    id: 'math-formas',
    title: 'La ciudad de las formas y medidas',
    subtitle: 'Figuras, tamaños, lugar y tiempo',
    icon: '📏',
    lessons: [
      lesson('Encuentra la figura', 'Nombrar círculo, cuadrado, triángulo y rectángulo.', 'math-forma', 'Cuenta los lados si te ayuda.', [
        choice('¿Cuál no tiene esquinas?', 'CÍRCULO', ['CÍRCULO', 'CUADRADO', 'TRIÁNGULO']),
        choice('¿Cuál tiene 3 lados?', 'TRIÁNGULO', ['TRIÁNGULO', 'CUADRADO', 'RECTÁNGULO']),
        choice('¿Cuál tiene 4 lados iguales?', 'CUADRADO', ['CUADRADO', 'CÍRCULO', 'TRIÁNGULO']),
        choice('Una puerta se parece a un…', 'RECTÁNGULO', ['RECTÁNGULO', 'CÍRCULO', 'TRIÁNGULO']),
      ]),
      lesson('Más largo y más alto', 'Comparar medidas de forma visual.', 'math-medida', 'Compara sin usar una regla todavía.', [
        choice('Una serpiente 🐍 y un gusano. ¿Cuál suele ser más larga?', 'LA SERPIENTE', ['LA SERPIENTE', 'EL GUSANO', 'MIDEN IGUAL']),
        choice('Una jirafa y un gato. ¿Quién es más alto?', 'LA JIRAFA', ['LA JIRAFA', 'EL GATO', 'MIDEN IGUAL']),
        choice('Un lápiz y una regla larga. Si la regla llega más lejos, es…', 'MÁS LARGA', ['MÁS LARGA', 'MÁS CORTA', 'IGUAL']),
        choice('Dos vasos: uno lleno y uno con un sorbo. ¿Cuál tiene más agua?', 'EL LLENO', ['EL LLENO', 'EL DEL SORBO', 'IGUALES']),
      ]),
      lesson('Arriba, abajo y al lado', 'Describir posiciones.', 'math-lugar', 'El lugar se dice con palabras.', [
        choice('El sol está… del suelo.', 'ARRIBA', ['ARRIBA', 'DEBAJO', 'DENTRO']),
        choice('Las raíces de un árbol están… de la tierra.', 'DEBAJO', ['DEBAJO', 'ARRIBA', 'AL LADO']),
        choice('El gato está al lado de la casa, no encima. ¿Dónde está?', 'AL LADO', ['AL LADO', 'ENCIMA', 'DEBAJO']),
        choice('Si das un paso a la derecha, te mueves…', 'A LA DERECHA', ['A LA DERECHA', 'ARRIBA', 'ATRÁS']),
      ]),
      lesson('Tiempo y monedas', 'Nombrar momentos del día y contar monedas iguales.', 'math-tiempo', 'Mañana, tarde y noche son partes del día.', [
        choice('Desayunamos por la…', 'MAÑANA', ['MAÑANA', 'NOCHE', 'MEDIANOCHE']),
        choice('Después del día llega la…', 'NOCHE', ['NOCHE', 'MAÑANA DEL MISMO DÍA', 'NADA']),
        choice('Tienes 🪙🪙🪙 monedas iguales. ¿Cuántas son?', '3', around(3)),
        choice('Una semana de clase de lunes a viernes tiene… días.', '5', ['5', '7', '2']),
      ]),
      lesson('Clasifica figuras', 'Agrupar por una característica.', 'math-forma', 'Elige la regla del grupo.', [
        choice('🔴 🔵 🟢 son todos…', 'COLORES', ['COLORES', 'NÚMEROS', 'ANIMALES']),
        choice('⬜ 🔺 ⚪ son todos…', 'FIGURAS', ['FIGURAS', 'COMIDAS', 'SONIDOS']),
        choice('¿Cuál no es una figura plana?', 'PELOTA', ['PELOTA', 'CÍRCULO', 'CUADRADO'], { hint: 'La pelota se puede tomar con la mano.' }),
        choice('Un cuadrado y un rectángulo se parecen porque tienen…', '4 LADOS', ['4 LADOS', '0 LADOS', '3 LADOS']),
      ]),
    ],
  },
  {
    id: 'math-problemas',
    title: 'El planeta de los problemas',
    subtitle: 'Historias cotidianas con números',
    icon: '🛒',
    lessons: [
      lesson('El mercado', 'Resolver una compra sencilla.', 'math-problema', 'Decide si juntas o quitas.', [
        choice('Compras 3 naranjas y 2 plátanos. ¿Cuántas frutas llevas?', '5', around(5)),
        choice('Llevas 8 pesos y gastas 3. ¿Cuántos te quedan?', '5', around(5)),
        choice('Cada bolsa tiene 2 panes. Hay 3 bolsas. ¿Cuántos panes hay?', '6', around(6), { hint: '2 y 2 y 2.' }),
        choice('Quieres 6 huevos y ya tienes 4. ¿Cuántos te faltan?', '2', around(2)),
      ]),
      lesson('En el parque', 'Usar números en una situación de juego.', 'math-problema', 'Dibuja la historia en tu cabeza.', [
        choice('Hay 4 columpios y 7 niños. ¿Sobran niños o columpios?', 'SOBRAN NIÑOS', ['SOBRAN NIÑOS', 'SOBRAN COLUMPIOS', 'HAY IGUALES']),
        choice('Llegan 2 niños más a un grupo de 5. ¿Cuántos hay ahora?', '7', around(7)),
        choice('Se van 3 de 9 palomas. ¿Cuántas se quedan?', '6', around(6)),
        choice('Un turno dura 1 ronda y ya jugaron 1. ¿Cuántas rondas faltan para 3?', '2', around(2)),
      ]),
      lesson('Elige la operación', 'Decidir si la historia suma o resta.', 'math-operacion', 'La pregunta dice qué buscar.', [
        choice('«¿Cuántos quedan?» suele pedir…', 'RESTA', ['RESTA', 'SUMA', 'UN PATRÓN']),
        choice('«¿Cuántos hay en total?» suele pedir…', 'SUMA', ['SUMA', 'RESTA', 'EL NÚMERO MAYOR']),
        choice('Había 10 y se perdieron 4. ¿Cuántos quedan?', '6', around(6)),
        choice('Había 10 y encontraron 4 más. ¿Cuántos hay?', '14', ['14', '6', '10']),
      ]),
      lesson('Datos de una imagen', 'Leer información visual antes de calcular.', 'math-problema', 'Cuenta solo lo que pregunta.', [
        choice('🐶🐶 🐱🐱🐱. ¿Cuántos animales hay?', '5', around(5)),
        choice('🐶🐶 🐱🐱🐱. ¿Cuántos gatos hay?', '3', around(3)),
        choice('🔴🔴 🔵. ¿Cuántos objetos rojos hay?', '2', around(2)),
        choice('🚗🚗🚗 🚲. ¿Hay más carros o bicicletas?', 'CARROS', ['CARROS', 'BICICLETAS', 'IGUALES']),
      ]),
      lesson('El desafío matemático', 'Combinar conteo, suma y resta.', 'math-problema', 'Haz un paso y luego el otro.', [
        choice('Tienes 2 y te dan 2. Luego regalas 1. ¿Cuántos te quedan?', '3', around(3)),
        choice('Cuenta de 2 en 2: 2, 4, 6. ¿Cuál sigue?', '8', ['8', '7', '10']),
        choice('¿Qué es mayor, 4 + 1 o 3 + 3?', '3 + 3', ['3 + 3', '4 + 1', 'SON IGUALES']),
        choice('Si 5 − 2 = 3, ¿cuánto es 5 − 1?', '4', around(4), { hint: 'Quitaste uno menos.' }),
      ]),
    ],
  },
]

export const MATH_SKILL_TITLES: Record<string, string> = {
  'math-numero': 'Reconocer números',
  'math-contar': 'Contar objetos',
  'math-comparar': 'Comparar cantidades',
  'math-secuencia': 'Anterior y posterior',
  'math-patron': 'Completar patrones',
  'math-orden': 'Ordenar números',
  'math-suma': 'Comprender la suma',
  'math-resta': 'Comprender la resta',
  'math-operacion': 'Elegir la operación',
  'math-forma': 'Reconocer figuras',
  'math-medida': 'Comparar medidas',
  'math-lugar': 'Describir posiciones',
  'math-tiempo': 'Tiempo y cantidades cotidianas',
  'math-problema': 'Resolver un problema',
}

export const MATH_PACK = packSubject('math', worlds, MATH_SKILL_TITLES)
