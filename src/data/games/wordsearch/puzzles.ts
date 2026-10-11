import { contentFitsLearner } from '@/lib/grade'
import { generateWordSearch, type WordSearchPuzzle } from '@/lib/wordsearch'
import type { SchoolGrade } from '@/types'

export interface WordSearchLevelDef {
  id: string
  order: number
  title: string
  subtitle: string
  icon: string
  size: number
  words: string[]
  minAge: number
  maxAge: number
  minGrade: number
  maxGrade: number
}

export const WORDSEARCH_LEVEL_DEFS: WordSearchLevelDef[] = [
  {
    id: 'wordsearch-l1',
    order: 1,
    title: 'Palabras cortas',
    subtitle: 'Encuentra palabras fáciles de 3–4 letras',
    icon: '⭐',
    size: 8,
    words: ['SOL', 'LUNA', 'MAR', 'CASA', 'GATO', 'MESA'],
    minAge: 3,
    maxAge: 12,
    minGrade: 0,
    maxGrade: 3,
  },
  {
    id: 'wordsearch-l2',
    order: 2,
    title: 'Colegio divertido',
    subtitle: 'Palabras del aula y de aprender',
    icon: '📚',
    size: 9,
    words: ['LIBRO', 'LAPIZ', 'TAREA', 'CLASE', 'AMIGO', 'JUEGO'],
    minAge: 5,
    maxAge: 12,
    minGrade: 1,
    maxGrade: 4,
  },
  {
    id: 'wordsearch-l3',
    order: 3,
    title: 'Aventura Sorova',
    subtitle: 'Palabras de la marca y la aventura',
    icon: '🎮',
    size: 10,
    words: ['SOROVA', 'JUEGO', 'ESTRELLA', 'SUENO', 'LOGRO', 'AVENTURA'],
    minAge: 6,
    maxAge: 12,
    minGrade: 2,
    maxGrade: 6,
  },
  {
    id: 'wordsearch-l4',
    order: 4,
    title: 'Naturaleza',
    subtitle: 'Animales y lugares para explorar',
    icon: '🌿',
    size: 10,
    words: ['ARBOL', 'FLORES', 'RIO', 'NUBE', 'PAJARO', 'MONTAÑA'],
    minAge: 7,
    maxAge: 12,
    minGrade: 3,
    maxGrade: 6,
  },
  {
    id: 'wordsearch-l5',
    order: 5,
    title: 'Mi familia',
    subtitle: 'Palabras de las personas de casa',
    icon: '👨‍👩‍👧',
    size: 9,
    words: ['MAMA', 'PAPA', 'BEBE', 'TIO', 'PRIMO', 'NENA'],
    minAge: 4,
    maxAge: 10,
    minGrade: 0,
    maxGrade: 4,
  },
  {
    id: 'wordsearch-l6',
    order: 6,
    title: 'Colores y comida',
    subtitle: 'Encuentra colores y alimentos',
    icon: '🍎',
    size: 9,
    words: ['ROJO', 'AZUL', 'VERDE', 'PAN', 'LECHE', 'SOPA'],
    minAge: 5,
    maxAge: 12,
    minGrade: 1,
    maxGrade: 6,
  },
]

const cache = new Map<string, WordSearchPuzzle>()

export function getWordSearchPuzzle(levelId: string): WordSearchPuzzle | undefined {
  const def = WORDSEARCH_LEVEL_DEFS.find((item) => item.id === levelId)
  if (!def) return undefined
  const cached = cache.get(levelId)
  if (cached) return cached
  const puzzle = generateWordSearch(def.id, def.title, def.words, def.size)
  cache.set(levelId, puzzle)
  return puzzle
}

export function getWordSearchLevelsForAge(
  age: number | null,
  grade: SchoolGrade | null = null,
) {
  return WORDSEARCH_LEVEL_DEFS.filter((level) =>
    contentFitsLearner(level, { age, grade }),
  )
}
