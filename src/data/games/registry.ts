import type { GameDefinition } from '@/types'
import { BRAND_COLORS } from '@/config/app'

export const GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: 'wordsearch',
    slug: 'sopa-de-letras',
    title: 'Sopa de letras',
    shortTitle: 'Sopa',
    description: 'Encuentra palabras escondidas con la magia Sorova.',
    icon: '🔤',
    status: 'available',
    accent: BRAND_COLORS.violet,
    totalLevels: 6,
  },
  {
    id: 'reading',
    slug: 'aprende-a-leer',
    title: 'Aprende a leer',
    shortTitle: 'Leer',
    description: 'Letras, sílabas, palabras e historias divertidas.',
    icon: '📚',
    status: 'available',
    accent: BRAND_COLORS.pink,
    totalLevels: 8,
  },
  {
    id: 'typing',
    slug: 'teclea-como-una-experta',
    title: 'Teclea como una experta',
    shortTitle: 'Teclear',
    description: 'Aprende el teclado, gana precisión y velocidad.',
    icon: '⌨️',
    status: 'available',
    accent: BRAND_COLORS.indigo,
    totalLevels: 8,
  },
  {
    id: 'memory',
    slug: 'memoria',
    title: 'Memoria',
    shortTitle: 'Memoria',
    description: 'Entrena tu memoria con retos divertidos.',
    icon: '🧠',
    status: 'coming_soon',
    accent: BRAND_COLORS.violet,
    totalLevels: 0,
  },
  {
    id: 'math',
    slug: 'matematicas',
    title: 'Matemáticas',
    shortTitle: 'Mate',
    description: 'Números, sumas y juegos de cálculo.',
    icon: '🔢',
    status: 'coming_soon',
    accent: BRAND_COLORS.amber,
    totalLevels: 0,
  },
  {
    id: 'science',
    slug: 'ciencias',
    title: 'Ciencias',
    shortTitle: 'Ciencias',
    description: 'Descubre el mundo con curiosidad.',
    icon: '🌎',
    status: 'coming_soon',
    accent: BRAND_COLORS.emerald,
    totalLevels: 0,
  },
  {
    id: 'english',
    slug: 'ingles',
    title: 'Inglés',
    shortTitle: 'English',
    description: 'Palabras y frases en inglés.',
    icon: '🇺🇸',
    status: 'coming_soon',
    accent: BRAND_COLORS.sky,
    totalLevels: 0,
  },
  {
    id: 'creativity',
    slug: 'creatividad',
    title: 'Creatividad',
    shortTitle: 'Crear',
    description: 'Colorea, inventa y expresa ideas.',
    icon: '🎨',
    status: 'coming_soon',
    accent: BRAND_COLORS.pink,
    totalLevels: 0,
  },
]

export function getGameById(id: string): GameDefinition | undefined {
  return GAME_DEFINITIONS.find((game) => game.id === id)
}

export function getGameBySlug(slug: string): GameDefinition | undefined {
  return GAME_DEFINITIONS.find((game) => game.slug === slug)
}
