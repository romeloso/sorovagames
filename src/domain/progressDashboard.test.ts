import { describe, expect, it } from 'vitest'
import type { ChildProfile, GameProgress, TutorAccount } from '@/types'
import {
  buildProgressDashboard,
  filterProgressDashboard,
  sortProgressDashboard,
  summarizeProgress,
  EMPTY_PROGRESS_FILTERS,
} from './progressDashboard'

const today = new Date(2026, 9, 11)

function profile(partial: Partial<ChildProfile> & Pick<ChildProfile, 'id' | 'name'>): ChildProfile {
  return {
    avatar: '⭐',
    avatarImage: '/foto.jpg',
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
    createdAt: '',
    updatedAt: '',
    ...partial,
  }
}

function lesson(id: string, completions: number): GameProgress['lessonProgress'][string] {
  return { lessonId: id, stars: 0, bestAccuracy: 1, completions, lastPlayedAt: null, unlocked: true }
}

describe('dashboard de progreso', () => {
  const tutors: TutorAccount[] = [
    { id: 'tutor-sorova', name: 'Familia Sorova', accessCode: 'FAMILIASOROVA', active: true, createdAt: '' },
  ]
  const isabella = profile({
    id: 'isabella',
    name: 'Isabella',
    birthDate: '2020-03-15',
    grade: 1,
    tutorId: 'tutor-sorova',
    level: 3,
    xp: 410,
    coins: 73,
    streakDays: 1,
    achievements: ['a', 'b', 'c'],
  })
  const sophia = profile({
    id: 'sophia',
    name: 'Sophia',
    birthDate: '2017-12-04',
    grade: 2,
    tutorId: 'tutor-sorova',
    level: 1,
    xp: 20,
  })
  const reading: GameProgress = {
    gameId: 'reading',
    unlockedLevelIds: [],
    lessonProgress: { a: lesson('a', 1), b: lesson('b', 0) },
    stats: { wordsLearned: [], lessonsCompleted: 2, correctAnswers: 1, totalAnswers: 2 },
  }
  const typing: GameProgress = {
    gameId: 'typing',
    unlockedLevelIds: [],
    lessonProgress: {},
    stats: { bestWpm: 0, bestAccuracy: 0, keysPracticed: [], lessonsCompleted: 0, totalKeystrokes: 0, correctKeystrokes: 0 },
  }

  const rows = buildProgressDashboard([isabella, sophia], tutors, { isabella: { reading, typing } }, today)

  it('arma la ficha de la tarjeta sin la foto', () => {
    const row = rows.find((item) => item.id === 'isabella')
    expect(row).toMatchObject({
      name: 'Isabella',
      level: 3,
      age: 6,
      gradeLabel: '1° grado',
      tutorName: 'Familia Sorova',
      xp: 410,
      coins: 73,
      streakDays: 1,
      achievements: 3,
      wordsLearned: 0,
      readingLessons: 2,
      readingProgress: 0.5,
      typingWpm: 0,
      typingAccuracy: 0,
    })
    expect(row).not.toHaveProperty('avatarImage')
  })

  it('filtra por texto, tutor y logros a la vez', () => {
    const visible = filterProgressDashboard(rows, {
      ...EMPTY_PROGRESS_FILTERS,
      query: '410',
      tutorId: 'tutor-sorova',
      achievements: 'some',
    })
    expect(visible.map((row) => row.id)).toEqual(['isabella'])
  })

  it('ordena por XP de mayor a menor', () => {
    const sorted = sortProgressDashboard(rows, 'xp', 'desc')
    expect(sorted.map((row) => row.name)).toEqual(['Isabella', 'Sophia'])
  })

  it('resume los niños que quedan tras el filtro', () => {
    const summary = summarizeProgress(filterProgressDashboard(rows, { ...EMPTY_PROGRESS_FILTERS, level: '3' }))
    expect(summary).toMatchObject({ count: 1, xp: 410, coins: 73, achievements: 3, readingLessons: 2 })
  })
})
