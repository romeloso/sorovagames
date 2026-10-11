import type { AdminPassageItem, AdminWordItem, StudyTopic } from '@/types'

const SEEDED_AT = '2026-01-01T00:00:00.000Z'

function word(
  id: string,
  value: string,
  clue: string,
  distractors: string[],
  minAge: number,
  maxAge: number,
  minGrade: number,
  maxGrade: number,
): AdminWordItem {
  return {
    id,
    word: value,
    clue,
    distractors,
    minAge,
    maxAge,
    minGrade,
    maxGrade,
    createdAt: SEEDED_AT,
  }
}

function passage(
  id: string,
  title: string,
  text: string,
  question: string,
  options: string[],
  answer: string,
  minAge: number,
  maxAge: number,
  minGrade: number,
  maxGrade: number,
): AdminPassageItem {
  return {
    id,
    title,
    text,
    question,
    options,
    answer,
    minAge,
    maxAge,
    minGrade,
    maxGrade,
    createdAt: SEEDED_AT,
  }
}

function topic(
  id: string,
  subjectId: StudyTopic['subjectId'],
  title: string,
  description: string,
  minAge: number,
  maxAge: number,
  minGrade: number,
  maxGrade: number,
  reinforce = false,
): StudyTopic {
  return {
    id,
    subjectId,
    title,
    description,
    minAge,
    maxAge,
    minGrade,
    maxGrade,
    reinforce,
    createdAt: SEEDED_AT,
  }
}

/** Palabras de fábrica para quiz y práctica de lectura. */
export const SEED_WORDS: AdminWordItem[] = [
  word('seed-word-gato', 'GATO', 'Animal que dice miau', ['PATO', 'GOTA'], 3, 7, 0, 2),
  word('seed-word-perro', 'PERRO', 'Animal que dice guau', ['PERA', 'CERRO'], 3, 7, 0, 2),
  word('seed-word-casa', 'CASA', 'Lugar donde vive una familia', ['CAMA', 'MASA'], 3, 8, 0, 2),
  word('seed-word-luna', 'LUNA', 'Brilla en el cielo de noche', ['LANA', 'LOMA'], 4, 8, 0, 3),
  word('seed-word-sol', 'SOL', 'Estrella que nos da luz de día', ['SAL', 'SEL'], 3, 7, 0, 2),
  word('seed-word-libro', 'LIBRO', 'Tiene páginas para leer', ['LIBRE', 'LABIO'], 6, 12, 1, 4),
  word('seed-word-escuela', 'ESCUELA', 'Lugar donde aprendemos', ['ESCALA', 'ESCUDO'], 6, 12, 1, 4),
  word('seed-word-familia', 'FAMILIA', 'Personas que te quieren en casa', ['FAMOSA', 'FAROLA'], 6, 12, 1, 5),
  word('seed-word-montana', 'MONTAÑA', 'Elevación grande de la tierra', ['MONTAJE', 'MONEDA'], 8, 12, 3, 6),
  word('seed-word-planeta', 'PLANETA', 'Cuerpo que gira alrededor de una estrella', ['PLANTA', 'PLATO'], 8, 12, 3, 6),
]

/** Historias cortas de fábrica para el nivel de lectura. */
export const SEED_PASSAGES: AdminPassageItem[] = [
  passage(
    'seed-pass-gato',
    'El gato Luna',
    'Luna es un gato gris. Duerme en la cama y juega con una bola roja.',
    '¿De qué color es la bola?',
    ['Roja', 'Azul', 'Verde'],
    'Roja',
    3,
    7,
    0,
    2,
  ),
  passage(
    'seed-pass-clase',
    'Día de clase',
    'Sofía llega a la escuela con su libro y su lápiz. En clase lee una historia con sus amigos.',
    '¿Qué lleva Sofía a la escuela?',
    ['Un libro y un lápiz', 'Una pelota', 'Un pez'],
    'Un libro y un lápiz',
    6,
    10,
    1,
    4,
  ),
  passage(
    'seed-pass-rio',
    'El río y el puente',
    'El río baja de la montaña. Un puente de madera cruza el agua y los pájaros cantan en los árboles.',
    '¿Qué cruza el río?',
    ['Un puente', 'Un tren', 'Una nube'],
    'Un puente',
    8,
    12,
    3,
    6,
  ),
]

/** Temas de estudio por materia, con rango de edad y grado. */
export const SEED_TOPICS: StudyTopic[] = [
  topic('seed-topic-reading-letters', 'reading', 'Letras y sonidos', 'Reconoce vocales y consonantes sencillas.', 3, 6, 0, 1),
  topic('seed-topic-reading-stories', 'reading', 'Leer historias', 'Lee un texto corto y responde una pregunta.', 7, 12, 2, 6),
  topic('seed-topic-typing-home', 'typing', 'Fila base', 'Practica A S D F y J K L Ñ sin mirar el teclado.', 3, 8, 0, 2, true),
  topic('seed-topic-typing-phrases', 'typing', 'Frases con ritmo', 'Escribe palabras largas y frases cortas con precisión.', 8, 12, 3, 6),
  topic('seed-topic-wordsearch-short', 'wordsearch', 'Palabras cortas', 'Encuentra palabras de tres y cuatro letras.', 3, 7, 0, 2),
  topic('seed-topic-wordsearch-nature', 'wordsearch', 'Naturaleza escondida', 'Busca animales, plantas y lugares en la sopa.', 7, 12, 3, 6),
  topic('seed-topic-memory-pairs', 'memory', 'Parejas', 'Observa y recuerda qué va junto.', 3, 7, 0, 2, true),
  topic('seed-topic-memory-sequence', 'memory', 'Secuencias', 'Repite un orden de colores o figuras.', 8, 12, 3, 6),
  topic('seed-topic-math-count', 'math', 'Contar hasta 10', 'Cuenta objetos y reconoce los números.', 3, 6, 0, 1),
  topic('seed-topic-math-add', 'math', 'Sumas y restas', 'Resuelve cuentas sencillas de sumar y restar.', 7, 12, 2, 6),
  topic('seed-topic-science-animals', 'science', 'Animales y su casa', 'Relaciona cada animal con su hábitat.', 3, 7, 0, 2),
  topic('seed-topic-science-water', 'science', 'El ciclo del agua', 'Sigue el viaje del agua: nube, lluvia y río.', 8, 12, 3, 6),
  topic('seed-topic-english-words', 'english', 'Colors and animals', 'Aprende colores y animales en inglés.', 3, 7, 0, 2),
  topic('seed-topic-english-sentences', 'english', 'Simple sentences', 'Arma frases cortas como “I like cats”.', 8, 12, 3, 6),
  topic('seed-topic-creativity-shapes', 'creativity', 'Colores y formas', 'Nombra colores y formas para crear.', 3, 7, 0, 2),
  topic('seed-topic-creativity-story', 'creativity', 'Inventar una historia', 'Imagina un personaje y un lugar.', 8, 12, 3, 6),
]
