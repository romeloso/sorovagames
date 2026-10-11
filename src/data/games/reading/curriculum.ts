import { LETTER_GUIDES } from '@/domain/reading/trace'
import type { Activity, LessonDefinition } from '@/types'
import { pictureFor } from './pictures'

const choice = (value: string) => ({ id: value, label: value, value })

interface LessonSeed {
  id: string
  world: string
  title: string
  objective: string
  skills: string[]
  instructions: string
  activities: Activity[]
}

function options(values: string[]) {
  return values.map((value) => choice(value))
}

function quiz(input: {
  id: string
  prompt: string
  answer: string
  choices: string[]
  speak?: string
  image?: string
  clue?: string
  hint?: string
}): Activity {
  const art = input.image ? pictureFor(input.image) : undefined
  return {
    id: input.id,
    kind: 'word_quiz',
    prompt: input.prompt,
    clue: input.clue ?? input.prompt,
    image: art?.emoji,
    imageAlt: art?.alt,
    speak: input.speak,
    hint: input.hint,
    options: options(input.choices),
    answer: input.answer,
  }
}

function letter(input: {
  id: string
  prompt: string
  letter: string
  choices: string[]
  speak?: string
  hint?: string
}): Activity {
  return {
    id: input.id,
    kind: 'letter_choice',
    prompt: input.prompt,
    letter: input.letter,
    speak: input.speak ?? input.letter.toLowerCase(),
    hint: input.hint,
    options: options(input.choices),
    answer: input.letter,
  }
}

function imageChoice(input: {
  id: string
  prompt: string
  word: string
  choices: string[]
  speak?: string
  hint?: string
}): Activity {
  const art = pictureFor(input.word)
  return {
    id: input.id,
    kind: 'word_quiz',
    prompt: input.prompt,
    clue: art?.alt ?? input.prompt,
    image: art?.emoji ?? '⭐',
    imageAlt: art?.alt ?? input.word,
    speak: input.speak ?? input.word.toLowerCase(),
    hint: input.hint,
    options: options(input.choices),
    answer: input.word,
  }
}

function syllable(input: {
  id: string
  prompt: string
  parts: string[]
  answer: string
  choices: string[]
  speak?: string
  hint?: string
}): Activity {
  return {
    id: input.id,
    kind: 'syllable_build',
    prompt: input.prompt,
    parts: input.parts,
    speak: input.speak,
    hint: input.hint,
    options: options(input.choices),
    answer: input.answer,
  }
}

function orderTokens(input: {
  id: string
  prompt: string
  tokens: string[]
  answer: string
  separator: '' | ' '
  speak?: string
  image?: string
  hint?: string
}): Activity {
  const art = input.image ? pictureFor(input.image) : undefined
  return {
    id: input.id,
    kind: 'token_order',
    prompt: input.prompt,
    tokens: input.tokens,
    answer: input.answer,
    separator: input.separator,
    image: art?.emoji,
    imageAlt: art?.alt,
    speak: input.speak,
    hint: input.hint,
  }
}

function scramble(input: {
  id: string
  prompt: string
  word: string
  letters: string[]
  speak?: string
  hint?: string
}): Activity {
  const art = pictureFor(input.word)
  return {
    id: input.id,
    kind: 'word_build',
    prompt: input.prompt,
    word: input.word,
    scrambled: input.letters,
    image: art?.emoji,
    imageAlt: art?.alt,
    speak: input.speak ?? input.word.toLowerCase(),
    hint: input.hint,
  }
}

function dictation(input: {
  id: string
  prompt: string
  answer: string
  speak: string
  hint?: string
}): Activity {
  return {
    id: input.id,
    kind: 'reading_practice',
    prompt: input.prompt,
    text: 'Escucha y escribe la palabra.',
    mode: 'type',
    answer: input.answer,
    speak: input.speak,
    hint: input.hint ?? 'Puedes pedir que te la repitan.',
  }
}

function sentence(input: {
  id: string
  text: string
  prompt: string
  answer: string
  choices: string[]
  hint?: string
}): Activity {
  return {
    id: input.id,
    kind: 'reading_practice',
    prompt: input.prompt,
    text: input.text,
    mode: 'choose',
    options: options(input.choices),
    answer: input.answer,
    speak: input.text,
    hint: input.hint,
  }
}

function trace(input: { id: string; letter: string; speak: string }): Activity {
  const checkpoints = LETTER_GUIDES[input.letter]
  if (!checkpoints) throw new Error(`Sin guía de trazo para ${input.letter}`)
  return {
    id: input.id,
    kind: 'trace_letter',
    prompt: `Traza la letra ${input.letter}. Sigue el modelo con calma.`,
    letter: input.letter,
    checkpoints,
    speak: input.speak,
    hint: 'La dirección general basta. No tiene que quedar perfecta.',
  }
}

function seed(input: Omit<LessonSeed, 'activities'> & { activities: Activity[] }): LessonSeed {
  return input
}

const seeds: LessonSeed[] = [
  seed({
    id: 'reading-sonidos-1',
    world: 'reading-sonidos',
    title: '¿Qué sonido escuchaste?',
    objective: 'Asociar un sonido de palabra con su imagen.',
    skills: ['escucha'],
    instructions: 'Escucha y toca la imagen correcta.',
    activities: [
      imageChoice({ id: 's1', prompt: 'Escucha y elige.', word: 'SOL', choices: ['SOL', 'LUNA', 'MAR'], speak: 'sol' }),
      imageChoice({ id: 's2', prompt: 'Escucha y elige.', word: 'LUNA', choices: ['OSO', 'LUNA', 'PAN'], speak: 'luna' }),
      imageChoice({ id: 's3', prompt: 'Escucha y elige.', word: 'OSO', choices: ['GATO', 'CASA', 'OSO'], speak: 'oso' }),
      imageChoice({ id: 's4', prompt: 'Escucha y elige.', word: 'PAN', choices: ['PAN', 'SOPA', 'PEZ'], speak: 'pan' }),
    ],
  }),
  seed({
    id: 'reading-sonidos-2',
    world: 'reading-sonidos',
    title: 'La caja de las rimas',
    objective: 'Reconocer palabras que riman.',
    skills: ['rima'],
    instructions: 'Dos palabras riman cuando terminan parecido.',
    activities: [
      quiz({ id: 'r1', prompt: '¿Qué palabra rima con sol?', answer: 'COL', choices: ['COL', 'PAN', 'MESA'], speak: 'sol', hint: 'Sol termina como col.' }),
      quiz({ id: 'r2', prompt: '¿Qué palabra rima con mar?', answer: 'PAR', choices: ['PAN', 'PAR', 'LUNA'], speak: 'mar' }),
      quiz({ id: 'r3', prompt: '¿Qué palabra rima con gato?', answer: 'PATO', choices: ['PATO', 'CASA', 'SOL'], speak: 'gato' }),
      quiz({ id: 'r4', prompt: '¿Qué palabra rima con casa?', answer: 'MASA', choices: ['MESA', 'MASA', 'OSO'], speak: 'casa' }),
    ],
  }),
  seed({
    id: 'reading-sonidos-3',
    world: 'reading-sonidos',
    title: '¿Qué palabras comienzan igual?',
    objective: 'Identificar el sonido inicial.',
    skills: ['sonido-inicial'],
    instructions: 'Escucha la palabra y elige el primer sonido.',
    activities: [
      quiz({ id: 'i1', prompt: '¿Con qué sonido empieza mamá?', answer: 'M', choices: ['M', 'P', 'S'], speak: 'mamá. Escucha el primer sonido: mmm.', hint: 'Mamá empieza como mesa.' }),
      quiz({ id: 'i2', prompt: '¿Con qué sonido empieza papá?', answer: 'P', choices: ['L', 'P', 'N'], speak: 'papá. El primer sonido es p.', hint: 'Papá empieza como pan.' }),
      quiz({ id: 'i3', prompt: '¿Con qué sonido empieza sol?', answer: 'S', choices: ['S', 'T', 'M'], speak: 'sol. El primer sonido es s.', hint: 'Sol empieza como sopa.' }),
      quiz({ id: 'i4', prompt: '¿Con qué sonido empieza luna?', answer: 'L', choices: ['N', 'R', 'L'], speak: 'luna. El primer sonido es l.', hint: 'Luna empieza como leche.' }),
    ],
  }),
  seed({
    id: 'reading-sonidos-4',
    world: 'reading-sonidos',
    title: 'El sonido del final',
    objective: 'Notar el último sonido de palabras cortas.',
    skills: ['sonido-final'],
    instructions: 'Escucha y elige cómo termina la palabra.',
    activities: [
      quiz({ id: 'f1', prompt: '¿Con qué sonido termina pan?', answer: 'N', choices: ['N', 'S', 'L'], speak: 'pan' }),
      quiz({ id: 'f2', prompt: '¿Con qué sonido termina sol?', answer: 'L', choices: ['L', 'M', 'P'], speak: 'sol' }),
      quiz({ id: 'f3', prompt: '¿Con qué sonido termina mar?', answer: 'R', choices: ['T', 'R', 'N'], speak: 'mar' }),
      quiz({ id: 'f4', prompt: '¿Con qué sonido termina pez?', answer: 'Z', choices: ['Z', 'S', 'L'], speak: 'pez' }),
    ],
  }),
  seed({
    id: 'reading-sonidos-5',
    world: 'reading-sonidos',
    title: 'Aplaude las sílabas',
    objective: 'Separar palabras en sílabas de forma oral.',
    skills: ['silabas-orales'],
    instructions: 'Cuenta los golpes: so-pa tiene dos.',
    activities: [
      quiz({ id: 'c1', prompt: '¿Cuántas sílabas tiene sol?', answer: '1', choices: ['1', '2', '3'], speak: 'sol. Un golpe: sol.', hint: 'Sol es una sola parte.' }),
      quiz({ id: 'c2', prompt: '¿Cuántas sílabas tiene casa?', answer: '2', choices: ['1', '2', '3'], speak: 'ca-sa. Dos golpes.', hint: 'Ca y sa.' }),
      quiz({ id: 'c3', prompt: '¿Cuántas sílabas tiene mamá?', answer: '2', choices: ['1', '2', '3'], speak: 'ma-má. Dos golpes.' }),
      quiz({ id: 'c4', prompt: '¿Cuántas sílabas tiene pelota?', answer: '3', choices: ['1', '2', '3'], speak: 'pe-lo-ta. Tres golpes.', hint: 'Pe, lo y ta.' }),
    ],
  }),
  seed({
    id: 'reading-sonidos-6',
    world: 'reading-sonidos',
    title: 'Junta los sonidos',
    objective: 'Combinar dos partes y reconocer la palabra.',
    skills: ['combinacion'],
    instructions: 'Escucha las dos partes y elige la palabra.',
    activities: [
      syllable({ id: 'j1', prompt: '¿Qué palabra se forma?', parts: ['ma', 'má'], answer: 'MAMÁ', choices: ['MAMÁ', 'MESA', 'MAPA'], speak: 'ma, má' }),
      syllable({ id: 'j2', prompt: '¿Qué palabra se forma?', parts: ['so', 'pa'], answer: 'SOPA', choices: ['SOL', 'SOPA', 'SAPO'], speak: 'so, pa' }),
      syllable({ id: 'j3', prompt: '¿Qué palabra se forma?', parts: ['lu', 'na'], answer: 'LUNA', choices: ['LUNA', 'LANA', 'LOMA'], speak: 'lu, na' }),
      syllable({ id: 'j4', prompt: '¿Qué palabra se forma?', parts: ['ga', 'to'], answer: 'GATO', choices: ['GOTA', 'GATO', 'PATO'], speak: 'ga, to' }),
    ],
  }),

  seed({
    id: 'reading-letras-a',
    world: 'reading-letras',
    title: 'La vocal A',
    objective: 'Reconocer la vocal A y su sonido.',
    skills: ['vocal-a'],
    instructions: 'La A se oye en mamá y en casa.',
    activities: [
      letter({ id: 'a1', prompt: '¿Qué vocal es?', letter: 'A', choices: ['A', 'E', 'I'], speak: 'a' }),
      imageChoice({ id: 'a2', prompt: '¿Cuál empieza con A?', word: 'ÁRBOL', choices: ['ÁRBOL', 'OSO', 'SOL'], speak: 'árbol' }),
      quiz({ id: 'a3', prompt: '¿Qué vocal escuchas en casa?', answer: 'A', choices: ['A', 'E', 'O'], speak: 'casa', hint: 'Ca-sa.' }),
      trace({ id: 'a4', letter: 'A', speak: 'Traza la a.' }),
    ],
  }),
  seed({
    id: 'reading-letras-e',
    world: 'reading-letras',
    title: 'La vocal E',
    objective: 'Reconocer la vocal E y su sonido.',
    skills: ['vocal-e'],
    instructions: 'La E se oye en elefante y en leche.',
    activities: [
      letter({ id: 'e1', prompt: '¿Qué vocal es?', letter: 'E', choices: ['A', 'E', 'O'], speak: 'e' }),
      imageChoice({ id: 'e2', prompt: '¿Cuál empieza con E?', word: 'ELEFANTE', choices: ['ELEFANTE', 'OSO', 'PAN'], speak: 'elefante' }),
      quiz({ id: 'e3', prompt: '¿Qué vocal está en leche?', answer: 'E', choices: ['E', 'I', 'U'], speak: 'leche' }),
      trace({ id: 'e4', letter: 'E', speak: 'Traza la e.' }),
    ],
  }),
  seed({
    id: 'reading-letras-i',
    world: 'reading-letras',
    title: 'La vocal I',
    objective: 'Reconocer la vocal I y su sonido.',
    skills: ['vocal-i'],
    instructions: 'La I es una vocal delgada. Se oye en isla.',
    activities: [
      letter({ id: 'i1', prompt: '¿Qué vocal es?', letter: 'I', choices: ['I', 'L', 'T'], speak: 'i' }),
      imageChoice({ id: 'i2', prompt: '¿Cuál empieza con I?', word: 'ISLA', choices: ['ISLA', 'OSO', 'UVA'], speak: 'isla' }),
      quiz({ id: 'i3', prompt: '¿Qué vocal falta en m_el?', answer: 'I', choices: ['I', 'A', 'O'], speak: 'miel', clue: 'La abeja hace miel.' }),
      trace({ id: 'i4', letter: 'I', speak: 'Traza la i.' }),
    ],
  }),
  seed({
    id: 'reading-letras-o',
    world: 'reading-letras',
    title: 'La vocal O',
    objective: 'Reconocer la vocal O y su sonido.',
    skills: ['vocal-o'],
    instructions: 'La O es redonda. Se oye en oso y en sol.',
    activities: [
      letter({ id: 'o1', prompt: '¿Qué vocal es?', letter: 'O', choices: ['O', 'C', 'U'], speak: 'o' }),
      imageChoice({ id: 'o2', prompt: '¿Cuál empieza con O?', word: 'OSO', choices: ['OSO', 'GATO', 'PAN'], speak: 'oso' }),
      quiz({ id: 'o3', prompt: '¿Qué vocal está en sol?', answer: 'O', choices: ['A', 'O', 'E'], speak: 'sol' }),
      trace({ id: 'o4', letter: 'O', speak: 'Traza la o.' }),
    ],
  }),
  seed({
    id: 'reading-letras-u',
    world: 'reading-letras',
    title: 'La vocal U',
    objective: 'Reconocer la vocal U y su sonido.',
    skills: ['vocal-u'],
    instructions: 'La U se oye en uva y en luna.',
    activities: [
      letter({ id: 'u1', prompt: '¿Qué vocal es?', letter: 'U', choices: ['U', 'V', 'O'], speak: 'u' }),
      imageChoice({ id: 'u2', prompt: '¿Cuál empieza con U?', word: 'UVA', choices: ['UVA', 'OSO', 'PAN'], speak: 'uva' }),
      quiz({ id: 'u3', prompt: '¿Qué vocal está en luna?', answer: 'U', choices: ['U', 'A', 'E'], speak: 'luna' }),
      trace({ id: 'u4', letter: 'U', speak: 'Traza la u.' }),
    ],
  }),
  seed({
    id: 'reading-letras-m',
    world: 'reading-letras',
    title: 'El sonido m',
    objective: 'Asociar la letra M con el sonido continuo /m/, como en mamá.',
    skills: ['consonante-m'],
    instructions: 'No decimos el nombre eme. Escuchamos mmm, como al inicio de mamá.',
    activities: [
      quiz({ id: 'm1', prompt: 'Escucha mamá. ¿Qué letra es el primer sonido?', answer: 'M', choices: ['M', 'P', 'N'], speak: 'mamá. El sonido es mmm.', hint: 'Los labios se juntan: mmm.' }),
      imageChoice({ id: 'm2', prompt: '¿Cuál empieza con M?', word: 'MESA', choices: ['MESA', 'SOPA', 'LUNA'], speak: 'mesa' }),
      quiz({ id: 'm3', prompt: '¿Dónde está la M?', answer: 'MAMÁ', choices: ['MAMÁ', 'PAPÁ', 'SOPA'], speak: 'mamá', clue: 'Elige la palabra que lleva M.' }),
      trace({ id: 'm4', letter: 'M', speak: 'Traza la m.' }),
    ],
  }),
  seed({
    id: 'reading-letras-p',
    world: 'reading-letras',
    title: 'El sonido p',
    objective: 'Asociar la letra P con el sonido /p/, como en papá y pan.',
    skills: ['consonante-p'],
    instructions: 'La P es un sonido corto. Se parece a la B, pero no vibra la garganta.',
    activities: [
      quiz({ id: 'p1', prompt: 'Escucha pan. ¿Qué letra es el primer sonido?', answer: 'P', choices: ['P', 'B', 'M'], speak: 'pan. El primer sonido es p.', hint: 'Pan empieza con p.' }),
      imageChoice({ id: 'p2', prompt: '¿Cuál empieza con P?', word: 'PAPÁ', choices: ['PAPÁ', 'MAMÁ', 'LUNA'], speak: 'papá' }),
      quiz({ id: 'p3', prompt: '¿Cuál no empieza con P?', answer: 'SOL', choices: ['PAN', 'PAPÁ', 'SOL'], speak: 'pan, papá, sol' }),
      trace({ id: 'p4', letter: 'P', speak: 'Traza la p.' }),
    ],
  }),
  seed({
    id: 'reading-letras-repaso',
    world: 'reading-letras',
    title: 'Repaso de letras',
    objective: 'Distinguir vocales y las letras M y P sin ayuda.',
    skills: ['vocal-a', 'consonante-m', 'consonante-p'],
    instructions: 'Este repaso se hace sin pista si puedes.',
    activities: [
      letter({ id: 'z1', prompt: 'Elige la vocal A.', letter: 'A', choices: ['E', 'A', 'O'] }),
      quiz({ id: 'z2', prompt: 'Mamá empieza con…', answer: 'M', choices: ['M', 'N', 'P'], speak: 'mamá' }),
      quiz({ id: 'z3', prompt: 'Pan empieza con…', answer: 'P', choices: ['B', 'P', 'T'], speak: 'pan' }),
      imageChoice({ id: 'z4', prompt: '¿Cuál empieza con O?', word: 'OSO', choices: ['OSO', 'UVA', 'ISLA'], speak: 'oso' }),
    ],
  }),

  seed({
    id: 'reading-silabas-1',
    world: 'reading-silabas',
    title: 'Ma, me, mi, mo, mu',
    objective: 'Leer sílabas directas con M.',
    skills: ['silaba-directa'],
    instructions: 'Une el sonido m con la vocal. Ma, no eme-a.',
    activities: [
      quiz({ id: 'sm1', prompt: 'Escucha y elige la sílaba.', answer: 'MA', choices: ['MA', 'ME', 'MI'], speak: 'ma' }),
      quiz({ id: 'sm2', prompt: 'Escucha y elige la sílaba.', answer: 'ME', choices: ['MA', 'ME', 'MU'], speak: 'me' }),
      quiz({ id: 'sm3', prompt: 'Escucha y elige la sílaba.', answer: 'MI', choices: ['MI', 'MU', 'MO'], speak: 'mi' }),
      quiz({ id: 'sm4', prompt: 'Escucha y elige la sílaba.', answer: 'MO', choices: ['MU', 'MA', 'MO'], speak: 'mo' }),
    ],
  }),
  seed({
    id: 'reading-silabas-2',
    world: 'reading-silabas',
    title: 'Completa la sílaba',
    objective: 'Completar la sílaba que falta en una palabra conocida.',
    skills: ['silaba-directa'],
    instructions: 'Mira la imagen y elige la primera sílaba.',
    activities: [
      quiz({ id: 'cs1', prompt: 'Mamá empieza con…', answer: 'MA', choices: ['MA', 'ME', 'MU'], image: 'MAMÁ', speak: 'mamá', clue: '___ má' }),
      quiz({ id: 'cs2', prompt: 'Papá empieza con…', answer: 'PA', choices: ['PA', 'PE', 'PO'], image: 'PAPÁ', speak: 'papá', clue: '___ pá' }),
      quiz({ id: 'cs3', prompt: 'Sopa empieza con…', answer: 'SO', choices: ['SA', 'SO', 'SU'], image: 'SOPA', speak: 'sopa', clue: '___ pa' }),
      quiz({ id: 'cs4', prompt: 'Luna empieza con…', answer: 'LU', choices: ['LA', 'LE', 'LU'], image: 'LUNA', speak: 'luna', clue: '___ na' }),
    ],
  }),
  seed({
    id: 'reading-silabas-3',
    world: 'reading-silabas',
    title: 'Construye una sílaba',
    objective: 'Juntar una consonante y una vocal.',
    skills: ['silaba-directa'],
    instructions: 'Elige la sílaba que forman las dos letras.',
    activities: [
      syllable({ id: 'b1', prompt: '¿Qué sílaba forman?', parts: ['m', 'a'], answer: 'MA', choices: ['MA', 'AM', 'ME'], speak: 'm, a' }),
      syllable({ id: 'b2', prompt: '¿Qué sílaba forman?', parts: ['p', 'e'], answer: 'PE', choices: ['EP', 'PE', 'PA'], speak: 'p, e' }),
      syllable({ id: 'b3', prompt: '¿Qué sílaba forman?', parts: ['s', 'o'], answer: 'SO', choices: ['OS', 'SU', 'SO'], speak: 's, o' }),
      syllable({ id: 'b4', prompt: '¿Qué sílaba forman?', parts: ['l', 'u'], answer: 'LU', choices: ['UL', 'LA', 'LU'], speak: 'l, u' }),
    ],
  }),
  seed({
    id: 'reading-silabas-4',
    world: 'reading-silabas',
    title: 'Ordena las sílabas',
    objective: 'Ordenar sílabas para formar una palabra.',
    skills: ['silaba-directa', 'palabra-bisilaba'],
    instructions: 'Pon las sílabas en el orden correcto.',
    activities: [
      orderTokens({ id: 'o1', prompt: 'Forma la palabra.', tokens: ['MÁ', 'MA'], answer: 'MAMÁ', separator: '', image: 'MAMÁ', speak: 'mamá' }),
      orderTokens({ id: 'o2', prompt: 'Forma la palabra.', tokens: ['PA', 'SO'], answer: 'SOPA', separator: '', image: 'SOPA', speak: 'sopa' }),
      orderTokens({ id: 'o3', prompt: 'Forma la palabra.', tokens: ['NA', 'LU'], answer: 'LUNA', separator: '', image: 'LUNA', speak: 'luna' }),
      orderTokens({ id: 'o4', prompt: 'Forma la palabra.', tokens: ['TO', 'GA'], answer: 'GATO', separator: '', image: 'GATO', speak: 'gato' }),
    ],
  }),
  seed({
    id: 'reading-silabas-5',
    world: 'reading-silabas',
    title: 'Palabras de dos sílabas',
    objective: 'Leer palabras bisílabas sencillas.',
    skills: ['palabra-bisilaba'],
    instructions: 'Lee la palabra en dos golpes y elige la imagen.',
    activities: [
      imageChoice({ id: 'd1', prompt: 'Lee y elige.', word: 'CASA', choices: ['CASA', 'CAMA', 'SOPA'], speak: 'ca-sa' }),
      imageChoice({ id: 'd2', prompt: 'Lee y elige.', word: 'MESA', choices: ['MESA', 'MASA', 'MANO'], speak: 'me-sa' }),
      imageChoice({ id: 'd3', prompt: 'Lee y elige.', word: 'SOPA', choices: ['SAPO', 'SOPA', 'SOL'], speak: 'so-pa' }),
      imageChoice({ id: 'd4', prompt: 'Lee y elige.', word: 'PALA', choices: ['PALA', 'PATO', 'PAN'], speak: 'pa-la' }),
    ],
  }),
  seed({
    id: 'reading-silabas-6',
    world: 'reading-silabas',
    title: 'Sílabas dentro de la palabra',
    objective: 'Identificar las sílabas de una palabra escrita.',
    skills: ['palabra-bisilaba'],
    instructions: 'Lee y elige cómo se parte la palabra.',
    activities: [
      quiz({ id: 'p1', prompt: '¿Cómo se parte mesa?', answer: 'ME-SA', choices: ['ME-SA', 'MA-SA', 'MES-A'], speak: 'mesa' }),
      quiz({ id: 'p2', prompt: '¿Cómo se parte casa?', answer: 'CA-SA', choices: ['CAS-A', 'CA-SA', 'CASA'], speak: 'casa' }),
      quiz({ id: 'p3', prompt: '¿Cómo se parte luna?', answer: 'LU-NA', choices: ['LUN-A', 'LA-NA', 'LU-NA'], speak: 'luna' }),
      quiz({ id: 'p4', prompt: '¿Cómo se parte sapo?', answer: 'SA-PO', choices: ['SA-PO', 'SO-PA', 'SAP-O'], speak: 'sapo' }),
    ],
  }),

  seed({
    id: 'reading-palabras-1',
    world: 'reading-palabras',
    title: 'Lee y encuentra',
    objective: 'Decodificar una palabra y relacionarla con su imagen.',
    skills: ['decodificacion'],
    instructions: 'Lee sin que te digan la palabra. Luego comprueba con el audio si quieres.',
    activities: [
      imageChoice({ id: 'lf1', prompt: '¿Qué palabra es?', word: 'GATO', choices: ['GATO', 'PATO', 'GOTA'], speak: 'gato' }),
      imageChoice({ id: 'lf2', prompt: '¿Qué palabra es?', word: 'NIDO', choices: ['NIDO', 'NUBE', 'MANO'], speak: 'nido' }),
      imageChoice({ id: 'lf3', prompt: '¿Qué palabra es?', word: 'MANO', choices: ['MONO', 'MANO', 'MESA'], speak: 'mano' }),
      imageChoice({ id: 'lf4', prompt: '¿Qué palabra es?', word: 'PEZ', choices: ['PEZ', 'PAN', 'PIE'], speak: 'pez' }),
    ],
  }),
  seed({
    id: 'reading-palabras-2',
    world: 'reading-palabras',
    title: '¿Qué letra falta?',
    objective: 'Completar palabras con la letra que falta.',
    skills: ['decodificacion'],
    instructions: 'La raya es la letra que falta.',
    activities: [
      quiz({ id: 'q1', prompt: 'CA_A', answer: 'S', choices: ['S', 'M', 'L'], image: 'CASA', speak: 'casa', clue: 'La casa', hint: 'Ca-sa.' }),
      quiz({ id: 'q2', prompt: 'SO_A', answer: 'P', choices: ['P', 'L', 'T'], image: 'SOPA', speak: 'sopa', clue: 'La sopa' }),
      quiz({ id: 'q3', prompt: 'LU_A', answer: 'N', choices: ['N', 'M', 'R'], image: 'LUNA', speak: 'luna', clue: 'La luna' }),
      quiz({ id: 'q4', prompt: 'GA_O', answer: 'T', choices: ['T', 'P', 'D'], image: 'GATO', speak: 'gato', clue: 'El gato' }),
    ],
  }),
  seed({
    id: 'reading-palabras-3',
    world: 'reading-palabras',
    title: 'Ordena las letras',
    objective: 'Ordenar letras para escribir una palabra.',
    skills: ['decodificacion'],
    instructions: 'Toca las letras en orden.',
    activities: [
      scramble({ id: 'sc1', prompt: 'Ordena las letras.', word: 'CASA', letters: ['A', 'C', 'S', 'A'], speak: 'casa' }),
      scramble({ id: 'sc2', prompt: 'Ordena las letras.', word: 'SOPA', letters: ['P', 'S', 'A', 'O'], speak: 'sopa' }),
      scramble({ id: 'sc3', prompt: 'Ordena las letras.', word: 'LUNA', letters: ['N', 'L', 'A', 'U'], speak: 'luna' }),
      scramble({ id: 'sc4', prompt: 'Ordena las letras.', word: 'MESA', letters: ['S', 'M', 'A', 'E'], speak: 'mesa' }),
    ],
  }),
  seed({
    id: 'reading-palabras-4',
    world: 'reading-palabras',
    title: 'Palabras que vemos siempre',
    objective: 'Reconocer palabras frecuentes dentro de una frase mínima.',
    skills: ['palabra-frecuente'],
    instructions: 'Estas palabras aparecen en casi todos los cuentos.',
    activities: [
      quiz({ id: 'fr1', prompt: '___ sol es amarillo.', answer: 'EL', choices: ['EL', 'LA', 'LOS'], speak: 'El sol es amarillo.', clue: 'El sol' }),
      quiz({ id: 'fr2', prompt: '___ luna sale de noche.', answer: 'LA', choices: ['EL', 'LA', 'UN'], speak: 'La luna sale de noche.' }),
      quiz({ id: 'fr3', prompt: 'Veo ___ gato.', answer: 'UN', choices: ['UN', 'UNA', 'EL'], speak: 'Veo un gato.' }),
      quiz({ id: 'fr4', prompt: '___ mamá cocina.', answer: 'MI', choices: ['MI', 'TU', 'SU'], speak: 'Mi mamá cocina.' }),
    ],
  }),
  seed({
    id: 'reading-palabras-5',
    world: 'reading-palabras',
    title: 'Encuentra la palabra bien escrita',
    objective: 'Elegir la forma correcta, con tilde cuando hace falta.',
    skills: ['decodificacion'],
    instructions: 'Mamá y papá llevan tilde en la última vocal.',
    activities: [
      quiz({ id: 'w1', prompt: '¿Cuál está bien escrita?', answer: 'MAMÁ', choices: ['MAMÁ', 'MAMA', 'MAMMA'], speak: 'mamá', image: 'MAMÁ' }),
      quiz({ id: 'w2', prompt: '¿Cuál está bien escrita?', answer: 'PAPÁ', choices: ['PAPA', 'PAPÁ', 'PAPAA'], speak: 'papá', image: 'PAPÁ' }),
      quiz({ id: 'w3', prompt: '¿Cuál está bien escrita?', answer: 'CASA', choices: ['CASA', 'KASA', 'CAZA'], speak: 'casa', image: 'CASA', clue: 'El lugar donde vives' }),
      quiz({ id: 'w4', prompt: '¿Cuál está bien escrita?', answer: 'SOL', choices: ['SOL', 'ZOL', 'SOLL'], speak: 'sol', image: 'SOL' }),
    ],
  }),
  seed({
    id: 'reading-palabras-6',
    world: 'reading-palabras',
    title: 'Palabras de tres sílabas',
    objective: 'Leer palabras de tres sílabas ya preparadas.',
    skills: ['decodificacion'],
    instructions: 'Parte la palabra: pe-lo-ta.',
    activities: [
      orderTokens({ id: 't1', prompt: 'Ordena las sílabas.', tokens: ['TA', 'PE', 'LO'], answer: 'PELOTA', separator: '', image: 'PELOTA', speak: 'pelota' }),
      orderTokens({ id: 't2', prompt: 'Ordena las sílabas.', tokens: ['MA', 'LO', 'PA'], answer: 'PALOMA', separator: '', image: 'PALOMA', speak: 'paloma' }),
      orderTokens({ id: 't3', prompt: 'Ordena las sílabas.', tokens: ['TA', 'MA', 'LE'], answer: 'MALETA', separator: '', image: 'MALETA', speak: 'maleta' }),
      orderTokens({ id: 't4', prompt: 'Ordena las sílabas.', tokens: ['SA', 'CA', 'MI'], answer: 'CAMISA', separator: '', image: 'CAMISA', speak: 'camisa' }),
    ],
  }),

  seed({
    id: 'reading-historias-1',
    world: 'reading-historias',
    title: 'Lee la oración',
    objective: 'Leer una oración breve y responder quién o qué.',
    skills: ['oracion'],
    instructions: 'Lee toda la oración antes de elegir.',
    activities: [
      sentence({ id: 'h1', text: 'El sol es amarillo.', prompt: '¿De qué color es el sol?', answer: 'AMARILLO', choices: ['AMARILLO', 'AZUL', 'VERDE'] }),
      sentence({ id: 'h2', text: 'La luna sale de noche.', prompt: '¿Cuándo sale la luna?', answer: 'DE NOCHE', choices: ['DE NOCHE', 'AL MEDIODÍA', 'NUNCA'] }),
      sentence({ id: 'h3', text: 'El gato bebe leche.', prompt: '¿Qué bebe el gato?', answer: 'LECHE', choices: ['LECHE', 'SOPA', 'AGUA'] }),
      sentence({ id: 'h4', text: 'Mamá cocina sopa.', prompt: '¿Quién cocina?', answer: 'MAMÁ', choices: ['MAMÁ', 'EL GATO', 'PAPÁ'] }),
    ],
  }),
  seed({
    id: 'reading-historias-2',
    world: 'reading-historias',
    title: 'Elige la imagen correcta',
    objective: 'Relacionar una oración con su significado.',
    skills: ['comprension'],
    instructions: 'La imagen ayuda, pero primero lee.',
    activities: [
      sentence({ id: 'im1', text: 'El oso come miel.', prompt: '¿Quién come miel?', answer: 'EL OSO', choices: ['EL OSO', 'EL PEZ', 'LA LUNA'] }),
      sentence({ id: 'im2', text: 'El pez nada en el mar.', prompt: '¿Dónde nada el pez?', answer: 'EN EL MAR', choices: ['EN EL MAR', 'EN LA CAMA', 'EN EL SOL'] }),
      sentence({ id: 'im3', text: 'Luma patea la pelota.', prompt: '¿Qué patea Luma?', answer: 'LA PELOTA', choices: ['LA PELOTA', 'LA SOPA', 'LA LUNA'] }),
      sentence({ id: 'im4', text: 'Papá abre la maleta.', prompt: '¿Qué abre papá?', answer: 'LA MALETA', choices: ['LA MALETA', 'LA CASA', 'EL NIDO'] }),
    ],
  }),
  seed({
    id: 'reading-historias-3',
    world: 'reading-historias',
    title: 'Ordena la oración',
    objective: 'Ordenar palabras para formar una oración.',
    skills: ['oracion'],
    instructions: 'La primera palabra empieza con mayúscula.',
    activities: [
      orderTokens({ id: 'or1', prompt: 'Ordena las palabras.', tokens: ['sopa', 'Mamá', 'cocina'], answer: 'Mamá cocina sopa', separator: ' ', speak: 'Mamá cocina sopa' }),
      orderTokens({ id: 'or2', prompt: 'Ordena las palabras.', tokens: ['leche', 'bebe', 'gato', 'El'], answer: 'El gato bebe leche', separator: ' ', speak: 'El gato bebe leche' }),
      orderTokens({ id: 'or3', prompt: 'Ordena las palabras.', tokens: ['sale', 'sol', 'El'], answer: 'El sol sale', separator: ' ', speak: 'El sol sale' }),
      orderTokens({ id: 'or4', prompt: 'Ordena las palabras.', tokens: ['mar', 'mira', 'Luna', 'el'], answer: 'Luna mira el mar', separator: ' ', speak: 'Luna mira el mar' }),
    ],
  }),
  seed({
    id: 'reading-historias-4',
    world: 'reading-historias',
    title: 'El cuento de Luma',
    objective: 'Comprender un cuento corto: quién, qué y dónde.',
    skills: ['comprension'],
    instructions: 'Lee el cuento. Puedes escucharlo otra vez.',
    activities: [
      sentence({
        id: 'cu1',
        text: 'Luma tiene un gato. El gato se llama Sol. Sol duerme en la cama.',
        prompt: '¿Cómo se llama el gato?',
        answer: 'SOL',
        choices: ['SOL', 'LUNA', 'OSO'],
      }),
      sentence({
        id: 'cu2',
        text: 'Luma tiene un gato. El gato se llama Sol. Sol duerme en la cama.',
        prompt: '¿Quién tiene un gato?',
        answer: 'LUMA',
        choices: ['LUMA', 'MAMÁ', 'PAPÁ'],
      }),
      sentence({
        id: 'cu3',
        text: 'Luma tiene un gato. El gato se llama Sol. Sol duerme en la cama.',
        prompt: '¿Dónde duerme Sol?',
        answer: 'EN LA CAMA',
        choices: ['EN LA CAMA', 'EN EL MAR', 'EN EL SOL'],
      }),
      sentence({
        id: 'cu4',
        text: 'Después, Luma y Sol juegan con la pelota.',
        prompt: '¿Con qué juegan?',
        answer: 'CON LA PELOTA',
        choices: ['CON LA PELOTA', 'CON LA SOPA', 'CON LA LUNA'],
      }),
    ],
  }),
  seed({
    id: 'reading-historias-5',
    world: 'reading-historias',
    title: '¿Qué pasó primero?',
    objective: 'Ordenar dos momentos de una historia.',
    skills: ['secuencia'],
    instructions: 'Primero y después no son lo mismo.',
    activities: [
      sentence({ id: 'sq1', text: 'Primero Luma saluda. Después juega.', prompt: '¿Qué pasó primero?', answer: 'SALUDA', choices: ['SALUDA', 'JUEGA', 'DUERME'] }),
      sentence({ id: 'sq2', text: 'Mamá cocina. Luego sirve la sopa.', prompt: '¿Qué pasa luego?', answer: 'SIRVE LA SOPA', choices: ['SIRVE LA SOPA', 'COCINA', 'DUERME'] }),
      sentence({ id: 'sq3', text: 'El sol sale. Después el día está claro.', prompt: '¿Qué pasó primero?', answer: 'EL SOL SALE', choices: ['EL SOL SALE', 'LLEGA LA NOCHE', 'EL DÍA ESTÁ CLARO'] }),
      sentence({ id: 'sq4', text: 'Sol se esconde. Al final, Luma lo encuentra.', prompt: '¿Qué pasa al final?', answer: 'LUMA LO ENCUENTRA', choices: ['LUMA LO ENCUENTRA', 'SOL SE ESCONDE', 'LUNA SE VA'] }),
    ],
  }),

  seed({
    id: 'reading-escritura-1',
    world: 'reading-escritura',
    title: 'Traza las vocales',
    objective: 'Practicar el trazo de A, E, I y O.',
    skills: ['trazado'],
    instructions: 'Sigue el modelo. Si el trazo se tuerce un poco, no pasa nada.',
    activities: [
      trace({ id: 'tr1', letter: 'A', speak: 'Traza la a.' }),
      trace({ id: 'tr2', letter: 'E', speak: 'Traza la e.' }),
      trace({ id: 'tr3', letter: 'I', speak: 'Traza la i.' }),
      trace({ id: 'tr4', letter: 'O', speak: 'Traza la o.' }),
    ],
  }),
  seed({
    id: 'reading-escritura-2',
    world: 'reading-escritura',
    title: 'Traza m, p, s y l',
    objective: 'Trazar consonantes útiles para escribir palabras sencillas.',
    skills: ['trazado'],
    instructions: 'También puedes escribir la letra con el teclado.',
    activities: [
      trace({ id: 'tc1', letter: 'M', speak: 'Traza la m.' }),
      trace({ id: 'tc2', letter: 'P', speak: 'Traza la p.' }),
      trace({ id: 'tc3', letter: 'S', speak: 'Traza la s.' }),
      trace({ id: 'tc4', letter: 'L', speak: 'Traza la l.' }),
    ],
  }),
  seed({
    id: 'reading-escritura-3',
    world: 'reading-escritura',
    title: 'Escribe lo que escuchas',
    objective: 'Escribir palabras dictadas.',
    skills: ['dictado'],
    instructions: 'Escucha, escribe y comprueba. La tilde de mamá sí cuenta.',
    activities: [
      dictation({ id: 'di1', prompt: 'Escribe la palabra.', answer: 'SOL', speak: 'sol' }),
      dictation({ id: 'di2', prompt: 'Escribe la palabra.', answer: 'LUNA', speak: 'luna' }),
      dictation({ id: 'di3', prompt: 'Escribe la palabra.', answer: 'MAMÁ', speak: 'mamá', hint: 'Mamá lleva tilde.' }),
      dictation({ id: 'di4', prompt: 'Escribe la palabra.', answer: 'CASA', speak: 'casa' }),
    ],
  }),
  seed({
    id: 'reading-escritura-4',
    world: 'reading-escritura',
    title: 'Ordena las palabras',
    objective: 'Formar una frase ordenando palabras.',
    skills: ['escritura-frase'],
    instructions: 'Lee cada palabra y ponla en su lugar.',
    activities: [
      orderTokens({ id: 'fp1', prompt: 'Forma la frase.', tokens: ['sol', 'El', 'sale'], answer: 'El sol sale', separator: ' ', speak: 'El sol sale' }),
      orderTokens({ id: 'fp2', prompt: 'Forma la frase.', tokens: ['casa', 'la', 'Veo'], answer: 'Veo la casa', separator: ' ', speak: 'Veo la casa' }),
      orderTokens({ id: 'fp3', prompt: 'Forma la frase.', tokens: ['gato', 'un', 'tengo', 'Yo'], answer: 'Yo tengo un gato', separator: ' ', speak: 'Yo tengo un gato' }),
      orderTokens({ id: 'fp4', prompt: 'Forma la frase.', tokens: ['leche', 'Mi', 'bebe', 'gato'], answer: 'Mi gato bebe leche', separator: ' ', speak: 'Mi gato bebe leche' }),
    ],
  }),
  seed({
    id: 'reading-escritura-5',
    world: 'reading-escritura',
    title: 'Escribe una frase',
    objective: 'Escribir una frase corta sobre una imagen.',
    skills: ['escritura-frase'],
    instructions: 'Escribe la frase que dice el audio. Puedes usar el teclado de la pantalla.',
    activities: [
      dictation({ id: 'ef1', prompt: 'Escribe la frase del sol.', answer: 'EL SOL', speak: 'el sol', hint: 'Son dos palabras: el sol.' }),
      dictation({ id: 'ef2', prompt: 'Escribe la frase del gato.', answer: 'EL GATO', speak: 'el gato' }),
      dictation({ id: 'ef3', prompt: 'Escribe la frase de la casa.', answer: 'LA CASA', speak: 'la casa' }),
      dictation({ id: 'ef4', prompt: 'Escribe la frase de mamá.', answer: 'MI MAMÁ', speak: 'mi mamá', hint: 'Mamá lleva tilde.' }),
    ],
  }),
]

function withIds(lesson: LessonSeed): LessonDefinition {
  return {
    id: lesson.id,
    gameId: 'reading',
    levelId: lesson.world,
    title: lesson.title,
    objective: lesson.objective,
    skillIds: lesson.skills,
    instructions: lesson.instructions,
    estimatedMinutes: 6,
    source: 'builtin',
    activities: lesson.activities.map((activity) => ({
      ...activity,
      id: `${lesson.id}-${activity.id}`,
    })),
  }
}

export const LEO_LESSONS: LessonDefinition[] = seeds.map(withIds)

export const READING_SKILLS: Array<{ id: string; title: string; worldId: string; prerequisites: string[] }> = [
  { id: 'escucha', title: 'Distinguir sonidos del habla', worldId: 'reading-sonidos', prerequisites: [] },
  { id: 'rima', title: 'Reconocer rimas', worldId: 'reading-sonidos', prerequisites: ['escucha'] },
  { id: 'sonido-inicial', title: 'Sonido inicial', worldId: 'reading-sonidos', prerequisites: ['escucha'] },
  { id: 'sonido-final', title: 'Sonido final', worldId: 'reading-sonidos', prerequisites: ['sonido-inicial'] },
  { id: 'silabas-orales', title: 'Separar sílabas al escuchar', worldId: 'reading-sonidos', prerequisites: ['escucha'] },
  { id: 'combinacion', title: 'Juntar sonidos', worldId: 'reading-sonidos', prerequisites: ['silabas-orales'] },
  { id: 'vocal-a', title: 'Vocal A', worldId: 'reading-letras', prerequisites: ['escucha'] },
  { id: 'vocal-e', title: 'Vocal E', worldId: 'reading-letras', prerequisites: ['vocal-a'] },
  { id: 'vocal-i', title: 'Vocal I', worldId: 'reading-letras', prerequisites: ['vocal-a'] },
  { id: 'vocal-o', title: 'Vocal O', worldId: 'reading-letras', prerequisites: ['vocal-a'] },
  { id: 'vocal-u', title: 'Vocal U', worldId: 'reading-letras', prerequisites: ['vocal-a'] },
  { id: 'consonante-m', title: 'Sonido y letra M', worldId: 'reading-letras', prerequisites: ['vocal-a'] },
  { id: 'consonante-p', title: 'Sonido y letra P', worldId: 'reading-letras', prerequisites: ['consonante-m'] },
  { id: 'silaba-directa', title: 'Sílabas directas', worldId: 'reading-silabas', prerequisites: ['consonante-m', 'vocal-a'] },
  { id: 'palabra-bisilaba', title: 'Palabras de dos sílabas', worldId: 'reading-silabas', prerequisites: ['silaba-directa'] },
  { id: 'decodificacion', title: 'Leer palabras nuevas', worldId: 'reading-palabras', prerequisites: ['palabra-bisilaba'] },
  { id: 'palabra-frecuente', title: 'Palabras frecuentes', worldId: 'reading-palabras', prerequisites: ['decodificacion'] },
  { id: 'oracion', title: 'Leer oraciones', worldId: 'reading-historias', prerequisites: ['decodificacion', 'palabra-frecuente'] },
  { id: 'comprension', title: 'Comprender un texto corto', worldId: 'reading-historias', prerequisites: ['oracion'] },
  { id: 'secuencia', title: 'Ordenar acontecimientos', worldId: 'reading-historias', prerequisites: ['comprension'] },
  { id: 'trazado', title: 'Trazar letras', worldId: 'reading-escritura', prerequisites: ['vocal-a'] },
  { id: 'dictado', title: 'Escribir al dictado', worldId: 'reading-escritura', prerequisites: ['decodificacion'] },
  { id: 'escritura-frase', title: 'Escribir una frase', worldId: 'reading-escritura', prerequisites: ['dictado', 'oracion'] },
]

export function skillTitleMap() {
  return Object.fromEntries(READING_SKILLS.map((skill) => [skill.id, skill.title]))
}

export function countLeoActivities() {
  return LEO_LESSONS.reduce((sum, lesson) => sum + lesson.activities.length, 0)
}
