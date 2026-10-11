import type { SortDirection } from '@/domain/childDirectory'
import { overallGameCompletion } from '@/domain/progress'
import { ageFromBirthDate, formatAge } from '@/lib/age'
import { formatGrade } from '@/lib/grade'
import type { ChildProfile, GameId, GameProgress, GameStats, SchoolGrade, TutorAccount } from '@/types'

export type ProgressSortKey =
  | 'name'
  | 'level'
  | 'age'
  | 'grade'
  | 'tutor'
  | 'xp'
  | 'coins'
  | 'streak'
  | 'achievements'
  | 'reading'
  | 'words'
  | 'lessons'
  | 'typing'
  | 'wpm'
  | 'accuracy'

export interface ProgressDashboardRow {
  id: string
  name: string
  level: number
  age: number | null
  ageLabel: string
  grade: SchoolGrade | null
  gradeLabel: string
  tutorId: string | null
  tutorName: string
  xp: number
  coins: number
  streakDays: number
  achievements: number
  readingProgress: number
  wordsLearned: number
  readingLessons: number
  typingProgress: number
  typingWpm: number
  typingAccuracy: number
}

export interface ProgressDashboardFilters {
  query: string
  grade: 'all' | 'none' | `${SchoolGrade}`
  tutorId: 'all' | 'none' | string
  level: 'all' | `${number}`
  streak: 'all' | 'none' | 'active'
  reading: 'all' | 'none' | 'started' | 'advanced'
  typing: 'all' | 'none' | 'started' | 'advanced'
  achievements: 'all' | 'none' | 'some'
}

export const EMPTY_PROGRESS_FILTERS: ProgressDashboardFilters = {
  query: '',
  grade: 'all',
  tutorId: 'all',
  level: 'all',
  streak: 'all',
  reading: 'all',
  typing: 'all',
  achievements: 'all',
}

export interface ProgressSummary {
  count: number
  xp: number
  coins: number
  averageStreak: number
  achievements: number
  readingLessons: number
  averageAccuracy: number
}

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

function readingStats(stats: GameStats | undefined) {
  if (!stats || !('wordsLearned' in stats) || !Array.isArray(stats.wordsLearned)) {
    return { wordsLearned: 0, lessons: 0 }
  }
  return { wordsLearned: stats.wordsLearned.length, lessons: stats.lessonsCompleted ?? 0 }
}

function typingStats(stats: GameStats | undefined) {
  if (!stats || !('bestWpm' in stats)) return { wpm: 0, accuracy: 0 }
  return { wpm: stats.bestWpm ?? 0, accuracy: stats.bestAccuracy ?? 0 }
}

function gameCompletion(game: GameProgress | undefined) {
  if (!game || Object.keys(game.lessonProgress).length === 0) return 0
  return overallGameCompletion(game)
}

export function buildProgressDashboard(
  profiles: ChildProfile[],
  tutors: TutorAccount[],
  progress: Record<string, Partial<Record<GameId, GameProgress>> | undefined>,
  today = new Date(),
): ProgressDashboardRow[] {
  const tutorName = new Map(tutors.map((tutor) => [tutor.id, tutor.name]))
  return profiles.map((profile) => {
    const games = progress[profile.id]
    const reading = games?.reading
    const typing = games?.typing
    const read = readingStats(reading?.stats)
    const typed = typingStats(typing?.stats)
    const age = ageFromBirthDate(profile.birthDate, today)
    return {
      id: profile.id,
      name: profile.name,
      level: profile.level,
      age,
      ageLabel: formatAge(age),
      grade: profile.grade,
      gradeLabel: formatGrade(profile.grade),
      tutorId: profile.tutorId,
      tutorName: (profile.tutorId && tutorName.get(profile.tutorId)) || 'Sin tutor',
      xp: profile.xp,
      coins: profile.coins,
      streakDays: profile.streakDays,
      achievements: profile.achievements.length,
      readingProgress: gameCompletion(reading),
      wordsLearned: read.wordsLearned,
      readingLessons: read.lessons,
      typingProgress: gameCompletion(typing),
      typingWpm: typed.wpm,
      typingAccuracy: typed.accuracy,
    }
  })
}

function matchesBand(value: number, band: ProgressDashboardFilters['reading']) {
  if (band === 'all') return true
  if (band === 'none') return value === 0
  if (band === 'started') return value > 0 && value < 0.5
  return value >= 0.5
}

export function filterProgressDashboard(rows: ProgressDashboardRow[], filters: ProgressDashboardFilters) {
  const query = fold(filters.query.trim())
  return rows.filter((row) => {
    if (query) {
      const haystack = fold(
        [
          row.name,
          `nivel ${row.level}`,
          row.ageLabel,
          row.gradeLabel,
          row.tutorName,
          String(row.xp),
          String(row.coins),
          String(row.streakDays),
          String(row.wordsLearned),
          String(row.readingLessons),
          String(Math.round(row.typingWpm)),
        ].join(' '),
      )
      if (!haystack.includes(query)) return false
    }
    if (filters.grade === 'none' && row.grade != null) return false
    if (filters.grade !== 'all' && filters.grade !== 'none' && String(row.grade) !== filters.grade) return false
    if (filters.tutorId === 'none' && row.tutorId) return false
    if (filters.tutorId !== 'all' && filters.tutorId !== 'none' && row.tutorId !== filters.tutorId) return false
    if (filters.level !== 'all' && String(row.level) !== filters.level) return false
    if (filters.streak === 'none' && row.streakDays > 0) return false
    if (filters.streak === 'active' && row.streakDays === 0) return false
    if (!matchesBand(row.readingProgress, filters.reading)) return false
    if (!matchesBand(row.typingProgress, filters.typing)) return false
    if (filters.achievements === 'none' && row.achievements > 0) return false
    if (filters.achievements === 'some' && row.achievements === 0) return false
    return true
  })
}

function compareText(left: string, right: string) {
  return left.localeCompare(right, 'es', { sensitivity: 'base', numeric: true })
}

export function sortProgressDashboard(
  rows: ProgressDashboardRow[],
  key: ProgressSortKey,
  direction: SortDirection,
) {
  const factor = direction === 'asc' ? 1 : -1
  return [...rows].sort((left, right) => {
    let result = 0
    if (key === 'name') result = compareText(left.name, right.name)
    if (key === 'level') result = left.level - right.level
    if (key === 'age') result = (left.age ?? -1) - (right.age ?? -1)
    if (key === 'grade') result = (left.grade ?? -1) - (right.grade ?? -1)
    if (key === 'tutor') result = compareText(left.tutorName, right.tutorName)
    if (key === 'xp') result = left.xp - right.xp
    if (key === 'coins') result = left.coins - right.coins
    if (key === 'streak') result = left.streakDays - right.streakDays
    if (key === 'achievements') result = left.achievements - right.achievements
    if (key === 'reading') result = left.readingProgress - right.readingProgress
    if (key === 'words') result = left.wordsLearned - right.wordsLearned
    if (key === 'lessons') result = left.readingLessons - right.readingLessons
    if (key === 'typing') result = left.typingProgress - right.typingProgress
    if (key === 'wpm') result = left.typingWpm - right.typingWpm
    if (key === 'accuracy') result = left.typingAccuracy - right.typingAccuracy
    if (result === 0) result = compareText(left.name, right.name)
    return result * factor
  })
}

export function summarizeProgress(rows: ProgressDashboardRow[]): ProgressSummary {
  const count = rows.length
  const xp = rows.reduce((sum, row) => sum + row.xp, 0)
  const coins = rows.reduce((sum, row) => sum + row.coins, 0)
  const achievements = rows.reduce((sum, row) => sum + row.achievements, 0)
  const readingLessons = rows.reduce((sum, row) => sum + row.readingLessons, 0)
  const streakTotal = rows.reduce((sum, row) => sum + row.streakDays, 0)
  const accuracyTotal = rows.reduce((sum, row) => sum + row.typingAccuracy, 0)
  return {
    count,
    xp,
    coins,
    averageStreak: count === 0 ? 0 : streakTotal / count,
    achievements,
    readingLessons,
    averageAccuracy: count === 0 ? 0 : accuracyTotal / count,
  }
}
