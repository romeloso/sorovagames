import { ageBandFromAge, ageBandLabel, ageFromBirthDate, formatAge, type AgeBand } from '@/lib/age'
import { formatGrade } from '@/lib/grade'
import { overallGameCompletion } from '@/domain/progress'
import type { ChildProfile, GameProgress, SchoolGrade, TutorAccount } from '@/types'

export type ChildSortKey =
  | 'name'
  | 'grade'
  | 'age'
  | 'tutor'
  | 'profile'
  | 'progress'
  | 'ageBand'
  | 'achievements'

export type SortDirection = 'asc' | 'desc'

export interface ChildDirectoryRow {
  id: string
  name: string
  grade: SchoolGrade | null
  gradeLabel: string
  age: number | null
  ageLabel: string
  tutorId: string | null
  tutorName: string
  profileCode: string
  progress: number
  ageBand: AgeBand
  ageBandLabel: string
  achievements: number
}

export interface ChildDirectoryFilters {
  query: string
  grade: 'all' | 'none' | `${SchoolGrade}`
  tutorId: 'all' | 'none' | string
  ageBand: 'all' | AgeBand
  progress: 'all' | 'none' | 'started' | 'advanced'
  achievements: 'all' | 'none' | 'some'
}

export const EMPTY_CHILD_FILTERS: ChildDirectoryFilters = {
  query: '',
  grade: 'all',
  tutorId: 'all',
  ageBand: 'all',
  progress: 'all',
  achievements: 'all',
}

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

function progressRatio(games: Record<string, GameProgress> | undefined) {
  const withLessons = Object.values(games ?? {}).filter(
    (game) => Object.keys(game.lessonProgress).length > 0,
  )
  if (withLessons.length === 0) return 0
  const total = withLessons.reduce((sum, game) => sum + overallGameCompletion(game), 0)
  return total / withLessons.length
}

export function buildChildDirectory(
  profiles: ChildProfile[],
  tutors: TutorAccount[],
  progress: Record<string, Record<string, GameProgress> | undefined>,
  today = new Date(),
): ChildDirectoryRow[] {
  const tutorName = new Map(tutors.map((tutor) => [tutor.id, tutor.name]))
  return profiles.map((profile) => {
    const age = ageFromBirthDate(profile.birthDate, today)
    const ageBand = ageBandFromAge(age)
    return {
      id: profile.id,
      name: profile.name,
      grade: profile.grade,
      gradeLabel: formatGrade(profile.grade),
      age,
      ageLabel: formatAge(age),
      tutorId: profile.tutorId,
      tutorName: (profile.tutorId && tutorName.get(profile.tutorId)) || 'Sin tutor',
      profileCode: profile.accessCode ?? 'Sin código',
      progress: progressRatio(progress[profile.id]),
      ageBand,
      ageBandLabel: age == null ? 'Edad sin definir' : ageBandLabel(ageBand),
      achievements: profile.achievements.length,
    }
  })
}

export function filterChildDirectory(rows: ChildDirectoryRow[], filters: ChildDirectoryFilters) {
  const query = fold(filters.query.trim())
  return rows.filter((row) => {
    if (query) {
      const haystack = fold(
        [row.name, row.gradeLabel, row.ageLabel, row.tutorName, row.profileCode, row.ageBandLabel].join(' '),
      )
      if (!haystack.includes(query)) return false
    }
    if (filters.grade === 'none' && row.grade != null) return false
    if (filters.grade !== 'all' && filters.grade !== 'none' && String(row.grade) !== filters.grade) {
      return false
    }
    if (filters.tutorId === 'none' && row.tutorId) return false
    if (filters.tutorId !== 'all' && filters.tutorId !== 'none' && row.tutorId !== filters.tutorId) {
      return false
    }
    if (filters.ageBand !== 'all' && (row.age == null || row.ageBand !== filters.ageBand)) return false
    if (filters.progress === 'none' && row.progress > 0) return false
    if (filters.progress === 'started' && (row.progress <= 0 || row.progress >= 0.5)) return false
    if (filters.progress === 'advanced' && row.progress < 0.5) return false
    if (filters.achievements === 'none' && row.achievements > 0) return false
    if (filters.achievements === 'some' && row.achievements === 0) return false
    return true
  })
}

function compareText(left: string, right: string) {
  return left.localeCompare(right, 'es', { sensitivity: 'base', numeric: true })
}

export function sortChildDirectory(
  rows: ChildDirectoryRow[],
  key: ChildSortKey,
  direction: SortDirection,
) {
  const factor = direction === 'asc' ? 1 : -1
  return [...rows].sort((left, right) => {
    let result = 0
    if (key === 'name') result = compareText(left.name, right.name)
    if (key === 'grade') result = (left.grade ?? -1) - (right.grade ?? -1)
    if (key === 'age') result = (left.age ?? -1) - (right.age ?? -1)
    if (key === 'tutor') result = compareText(left.tutorName, right.tutorName)
    if (key === 'profile') result = compareText(left.profileCode, right.profileCode)
    if (key === 'progress') result = left.progress - right.progress
    if (key === 'ageBand') result = compareText(left.ageBandLabel, right.ageBandLabel)
    if (key === 'achievements') result = left.achievements - right.achievements
    if (result === 0) result = compareText(left.name, right.name)
    return result * factor
  })
}
