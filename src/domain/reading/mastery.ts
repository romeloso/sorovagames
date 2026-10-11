import type {
  ActivityAttemptResult,
  GameLevelMeta,
  GameProgress,
  LessonDefinition,
  ReadingStats,
  SkillMasteryStatus,
  SkillProgressRecord,
} from '@/types'

export const MASTERY_ACCURACY = 0.85
export const MASTERY_MIN_INDEPENDENT = 4
export const MASTERY_MIN_SESSIONS = 2

const DAY_MS = 24 * 60 * 60 * 1000

export function isIndependentSuccess(result: ActivityAttemptResult) {
  return result.correct && result.attempts <= 1 && (result.hintsUsed ?? 0) === 0
}

export function skillStatus(record: SkillProgressRecord | undefined): SkillMasteryStatus {
  if (!record || (record.independentTotal === 0 && record.assistedCorrect === 0)) {
    return 'not_evaluated'
  }
  const accuracy =
    record.independentTotal === 0 ? 0 : record.independentCorrect / record.independentTotal
  if (
    record.sessions >= MASTERY_MIN_SESSIONS &&
    record.independentCorrect >= MASTERY_MIN_INDEPENDENT &&
    accuracy >= MASTERY_ACCURACY
  ) {
    return 'mastered'
  }
  if (record.independentTotal >= 3 && accuracy < 0.6) return 'needs_support'
  return 'developing'
}

function reviewDelay(status: SkillMasteryStatus) {
  if (status === 'mastered') return 3 * DAY_MS
  if (status === 'needs_support') return 0
  return DAY_MS
}

export function recordSkillPractice(
  current: Record<string, SkillProgressRecord>,
  skillIds: string[],
  input: {
    independentCorrect: number
    independentTotal: number
    assistedCorrect: number
    at: string
  },
): Record<string, SkillProgressRecord> {
  const next = { ...current }
  const atMs = Date.parse(input.at)
  for (const skillId of skillIds) {
    const previous = next[skillId]
    const merged: SkillProgressRecord = {
      skillId,
      independentCorrect: (previous?.independentCorrect ?? 0) + input.independentCorrect,
      independentTotal: (previous?.independentTotal ?? 0) + input.independentTotal,
      assistedCorrect: (previous?.assistedCorrect ?? 0) + input.assistedCorrect,
      sessions: (previous?.sessions ?? 0) + 1,
      lastPracticedAt: input.at,
      nextReviewAt: null,
      status: 'developing',
    }
    merged.status = skillStatus(merged)
    const delay = reviewDelay(merged.status)
    merged.nextReviewAt = Number.isNaN(atMs) ? input.at : new Date(atMs + delay).toISOString()
    next[skillId] = merged
  }
  return next
}

export function recommendNextLessonId(
  progress: GameProgress | null,
  levels: GameLevelMeta[],
  lessons: Pick<LessonDefinition, 'id' | 'skillIds'>[],
  now = Date.now(),
): string | null {
  if (!progress) return levels[0]?.lessonIds[0] ?? null
  const stats = progress.stats as ReadingStats
  const skills = stats.skills ?? {}
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))

  const unlockedLessons = levels.flatMap((level) => {
    if (!progress.unlockedLevelIds.includes(level.id)) return []
    return level.lessonIds.filter((lessonId) => progress.lessonProgress[lessonId]?.unlocked)
  })

  for (const lessonId of unlockedLessons) {
    const skillIds = lessonById.get(lessonId)?.skillIds ?? []
    const due = skillIds.some((skillId) => {
      const record = skills[skillId]
      if (!record?.nextReviewAt || record.status === 'not_evaluated') return false
      return Date.parse(record.nextReviewAt) <= now
    })
    if (due) return lessonId
  }

  const fresh = unlockedLessons.find((lessonId) => (progress.lessonProgress[lessonId]?.completions ?? 0) === 0)
  return fresh ?? unlockedLessons[0] ?? null
}

export function skillStatusLabel(status: SkillMasteryStatus) {
  if (status === 'mastered') return 'Dominada'
  if (status === 'developing') return 'En desarrollo'
  if (status === 'needs_support') return 'Necesita refuerzo'
  return 'Aún no evaluada'
}
