import type { GameLevelMeta, LessonDefinition } from '@/types'
import { TYPING_LESSONS } from './content'

export const TYPING_LEVELS: GameLevelMeta[] = [
  {
    id: 'typing-l1',
    gameId: 'typing',
    order: 1,
    title: 'Conocer el teclado',
    subtitle: 'Encuentra y pulsa cada tecla',
    icon: '⌨️',
    lessonIds: ['typing-l1-a', 'typing-l1-b'],
  },
  {
    id: 'typing-l2',
    gameId: 'typing',
    order: 2,
    title: 'Teclas básicas',
    subtitle: 'Fila base: ASD F JKLÑ',
    icon: '🖐️',
    lessonIds: ['typing-l2-a', 'typing-l2-b'],
  },
  {
    id: 'typing-l3',
    gameId: 'typing',
    order: 3,
    title: 'Letras individuales',
    subtitle: 'Pulsa rápido y con precisión',
    icon: '🔤',
    lessonIds: ['typing-l3-a', 'typing-l3-b'],
  },
  {
    id: 'typing-l4',
    gameId: 'typing',
    order: 4,
    title: 'Sílabas',
    subtitle: 'Escribe sílabas sencillas',
    icon: '🧩',
    lessonIds: ['typing-l4-a', 'typing-l4-b'],
  },
  {
    id: 'typing-l5',
    gameId: 'typing',
    order: 5,
    title: 'Palabras',
    subtitle: 'Escribe palabras completas',
    icon: '📝',
    lessonIds: ['typing-l5-a', 'typing-l5-b'],
  },
  {
    id: 'typing-l6',
    gameId: 'typing',
    order: 6,
    title: 'Palabras largas',
    subtitle: 'Escribe palabras de muchas letras',
    icon: '🐘',
    lessonIds: ['typing-l6-a', 'typing-l6-b'],
  },
  {
    id: 'typing-l7',
    gameId: 'typing',
    order: 7,
    title: 'Frases',
    subtitle: 'Escribe frases cortas con espacios',
    icon: '💬',
    lessonIds: ['typing-l7-a', 'typing-l7-b'],
  },
  {
    id: 'typing-l8',
    gameId: 'typing',
    order: 8,
    title: 'Retos de velocidad',
    subtitle: 'Una carrera larga de letras',
    icon: '⏱️',
    lessonIds: ['typing-l8-a', 'typing-l8-b'],
  },
]

export function getTypingLessons(): LessonDefinition[] {
  return TYPING_LESSONS
}

export function getTypingLesson(lessonId: string): LessonDefinition | undefined {
  return TYPING_LESSONS.find((lesson) => lesson.id === lessonId)
}
