import type { ContentBank, GameLevelMeta, LessonDefinition, SchoolGrade } from '@/types'
import { LEO_LESSONS } from './curriculum'
import { getCachedAdminReadingLessons } from '@/services/cache/contentCache'

export interface ReadingWorldMeta extends GameLevelMeta {
  accent: string
}

const ADMIN_BY_WORLD: Record<string, string[]> = {
  'reading-palabras': ['reading-admin-quiz'],
  'reading-historias': ['reading-admin-passages'],
  'reading-escritura': ['reading-admin-practice'],
}

export const READING_WORLDS: ReadingWorldMeta[] = [
  {
    id: 'reading-sonidos',
    gameId: 'reading',
    order: 1,
    title: 'La isla de los sonidos',
    subtitle: 'Escucha, rima y separa palabras',
    icon: '🌊',
    accent: '#3B82F6',
    lessonIds: LEO_LESSONS.filter((lesson) => lesson.levelId === 'reading-sonidos').map((lesson) => lesson.id),
  },
  {
    id: 'reading-letras',
    gameId: 'reading',
    order: 2,
    title: 'El bosque de las letras',
    subtitle: 'Vocales y los sonidos m y p',
    icon: '🌳',
    accent: '#EC4899',
    lessonIds: LEO_LESSONS.filter((lesson) => lesson.levelId === 'reading-letras').map((lesson) => lesson.id),
  },
  {
    id: 'reading-silabas',
    gameId: 'reading',
    order: 3,
    title: 'La fábrica de sílabas',
    subtitle: 'Une consonantes y vocales',
    icon: '🧩',
    accent: '#F59E0B',
    lessonIds: LEO_LESSONS.filter((lesson) => lesson.levelId === 'reading-silabas').map((lesson) => lesson.id),
  },
  {
    id: 'reading-palabras',
    gameId: 'reading',
    order: 4,
    title: 'La ciudad de las palabras',
    subtitle: 'Lee palabras nuevas',
    icon: '🏙️',
    accent: '#10B981',
    lessonIds: [
      ...LEO_LESSONS.filter((lesson) => lesson.levelId === 'reading-palabras').map((lesson) => lesson.id),
      ...(ADMIN_BY_WORLD['reading-palabras'] ?? []),
    ],
  },
  {
    id: 'reading-historias',
    gameId: 'reading',
    order: 5,
    title: 'El reino de las historias',
    subtitle: 'Oraciones y cuentos cortos',
    icon: '📖',
    accent: '#8B5CF6',
    lessonIds: [
      ...LEO_LESSONS.filter((lesson) => lesson.levelId === 'reading-historias').map((lesson) => lesson.id),
      ...(ADMIN_BY_WORLD['reading-historias'] ?? []),
    ],
  },
  {
    id: 'reading-escritura',
    gameId: 'reading',
    order: 6,
    title: 'El taller de escritores',
    subtitle: 'Traza, dicta y escribe frases',
    icon: '✏️',
    accent: '#6366F1',
    lessonIds: [
      ...LEO_LESSONS.filter((lesson) => lesson.levelId === 'reading-escritura').map((lesson) => lesson.id),
      ...(ADMIN_BY_WORLD['reading-escritura'] ?? []),
    ],
  },
]

export const READING_LEVELS: GameLevelMeta[] = READING_WORLDS

export function getBuiltinReadingLessons(): LessonDefinition[] {
  return LEO_LESSONS
}

export function getReadingLessons(
  bank?: ContentBank,
  age: number | null = null,
  grade: SchoolGrade | null = null,
): LessonDefinition[] {
  const adminLessons = bank ? getCachedAdminReadingLessons(bank, age, grade) : []
  const adminIds = new Set(adminLessons.map((lesson) => lesson.id))
  const builtin = getBuiltinReadingLessons().filter((lesson) => !adminIds.has(lesson.id))
  return [...builtin, ...adminLessons]
}

export function getReadingLesson(
  lessonId: string,
  bank?: ContentBank,
  age: number | null = null,
  grade: SchoolGrade | null = null,
): LessonDefinition | undefined {
  return getReadingLessons(bank, age, grade).find((lesson) => lesson.id === lessonId)
}

/** Mundos con lecciones realmente disponibles según el bank, edad y grado. */
export function getAvailableReadingLevels(
  bank?: ContentBank,
  age: number | null = null,
  grade: SchoolGrade | null = null,
): GameLevelMeta[] {
  const lessons = getReadingLessons(bank, age, grade)
  const availableIds = new Set(lessons.map((lesson) => lesson.id))

  return READING_WORLDS.map((level) => ({
    id: level.id,
    gameId: level.gameId,
    order: level.order,
    title: level.title,
    subtitle: level.subtitle,
    icon: level.icon,
    lessonIds: level.lessonIds.filter((id) => availableIds.has(id)),
  })).filter((level) => level.lessonIds.length > 0)
}

export function getReadingWorld(worldId: string) {
  return READING_WORLDS.find((world) => world.id === worldId)
}
