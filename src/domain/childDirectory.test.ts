import { describe, expect, it } from 'vitest'
import type { ChildProfile, GameProgress } from '@/types'
import {
  buildChildDirectory,
  filterChildDirectory,
  sortChildDirectory,
  EMPTY_CHILD_FILTERS,
} from './childDirectory'

const today = new Date(2026, 9, 11)

function profile(partial: Partial<ChildProfile> & Pick<ChildProfile, 'id' | 'name'>): ChildProfile {
  return {
    avatar: '⭐',
    avatarImage: '/avatars/photo/isabella-1.jpg',
    accent: '#111111',
    birthDate: null,
    grade: null,
    tutorId: null,
    accessCode: null,
    level: 1,
    xp: 0,
    points: 0,
    coins: 0,
    streakDays: 0,
    lastPlayedDate: null,
    achievements: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('directorio de niños', () => {
  const profiles = [
    profile({
      id: 'sophia',
      name: 'Sophia',
      birthDate: '2017-12-04',
      grade: 2,
      tutorId: 'tutor-sorova',
      accessCode: 'SOPHIA041217',
      achievements: ['first'],
    }),
    profile({
      id: 'ana',
      name: 'Ana',
      birthDate: '2019-02-03',
      grade: null,
      tutorId: 'tutor-casa',
      accessCode: 'ANA030219',
    }),
  ]

  const progress: Record<string, Record<string, GameProgress>> = {
    sophia: {
      reading: {
        gameId: 'reading',
        unlockedLevelIds: ['a'],
        lessonProgress: {
          one: {
            lessonId: 'one',
            stars: 1,
            bestAccuracy: 1,
            completions: 1,
            lastPlayedAt: null,
            unlocked: true,
          },
          two: {
            lessonId: 'two',
            stars: 0,
            bestAccuracy: 0,
            completions: 0,
            lastPlayedAt: null,
            unlocked: true,
          },
        },
        stats: { wordsLearned: [], lessonsCompleted: 1, correctAnswers: 1, totalAnswers: 1 },
      },
    },
  }

  const rows = buildChildDirectory(
    profiles,
    [
      { id: 'tutor-sorova', name: 'Familia Sorova', accessCode: 'FAMILIASOROVA', active: true, createdAt: '' },
      { id: 'tutor-casa', name: 'Casa López', accessCode: 'CASA1', active: true, createdAt: '' },
    ],
    progress,
    today,
  )

  it('calcula edad, tutor, avance y logros', () => {
    const sophia = rows.find((row) => row.id === 'sophia')
    expect(sophia?.age).toBe(8)
    expect(sophia?.tutorName).toBe('Familia Sorova')
    expect(sophia?.progress).toBe(0.5)
    expect(sophia?.achievements).toBe(1)
    expect(sophia?.ageBandLabel).toBe('Básico (6–8)')
  })

  it('filtra por texto, tutor y logros a la vez', () => {
    const filtered = filterChildDirectory(rows, {
      ...EMPTY_CHILD_FILTERS,
      query: 'sóphi',
      tutorId: 'tutor-sorova',
      achievements: 'some',
    })
    expect(filtered.map((row) => row.id)).toEqual(['sophia'])
  })

  it('ordena por grado y deja sin grado al inicio', () => {
    const sorted = sortChildDirectory(rows, 'grade', 'asc')
    expect(sorted.map((row) => row.name)).toEqual(['Ana', 'Sophia'])
  })
})