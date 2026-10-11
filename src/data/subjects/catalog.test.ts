import { describe, expect, it } from 'vitest'
import { countLeoActivities } from '@/data/games/reading/curriculum'
import { applyLessonResult, createInitialGameProgress } from '@/domain/progress'
import type { Activity, SubjectStats, TokenOrderActivity, WordQuizActivity } from '@/types'
import {
  SUBJECT_GAME_IDS,
  countSubjectActivities,
  getSubjectLessons,
  getSubjectLevels,
  subjectSkillTitles,
} from './catalog'

function isQuiz(activity: Activity): activity is WordQuizActivity {
  return activity.kind === 'word_quiz'
}

function isOrder(activity: Activity): activity is TokenOrderActivity {
  return activity.kind === 'token_order'
}

function orderAnswerMatches(activity: TokenOrderActivity) {
  const separator = activity.separator
  const pool = activity.tokens.map((token, index) => ({ token, index }))
  const used = new Set<number>()
  let rest = activity.answer
  while (used.size < pool.length) {
    const found = pool
      .filter((item) => !used.has(item.index) && (rest === item.token || rest.startsWith(`${item.token}${separator}`)))
      .sort((a, b) => b.token.length - a.token.length)[0]
    if (!found) return false
    used.add(found.index)
    rest = rest.slice(found.token.length)
    if (rest.startsWith(separator)) rest = rest.slice(separator.length)
  }
  return rest.length === 0
}

describe('catálogo de materias', () => {
  it('publica al menos 100 actividades por materia y 500 en total', () => {
    let total = countLeoActivities()
    expect(total).toBeGreaterThanOrEqual(100)
    for (const subjectId of SUBJECT_GAME_IDS) {
      const count = countSubjectActivities(subjectId)
      expect(getSubjectLevels(subjectId)).toHaveLength(6)
      expect(count).toBeGreaterThanOrEqual(100)
      total += count
    }
    expect(total).toBeGreaterThanOrEqual(500)
  })

  it('cada actividad tiene respuesta verificable y habilidad declarada', () => {
    const ids = new Set<string>()
    for (const subjectId of SUBJECT_GAME_IDS) {
      const titles = subjectSkillTitles(subjectId)
      for (const lesson of getSubjectLessons(subjectId)) {
        expect(lesson.objective).toBeTruthy()
        expect(lesson.instructions).toBeTruthy()
        expect(lesson.skillIds?.length).toBeGreaterThan(0)
        for (const skillId of lesson.skillIds ?? []) {
          expect(titles[skillId]).toBeTruthy()
        }
        for (const activity of lesson.activities) {
          expect(ids.has(activity.id)).toBe(false)
          ids.add(activity.id)
          expect(activity.prompt.length).toBeGreaterThan(3)
          if (isQuiz(activity)) {
            const values = activity.options.map((option) => option.value)
            expect(new Set(values).size).toBe(values.length)
            expect(values).toContain(activity.answer)
          }
          if (isOrder(activity)) {
            expect(orderAnswerMatches(activity)).toBe(true)
          }
        }
      }
    }
  })

  it('registra la habilidad de matemáticas y no abre el siguiente mundo con una sola lección', () => {
    const levels = getSubjectLevels('math')
    const first = levels[0]
    let progress = createInitialGameProgress('math', levels)
    progress = applyLessonResult(progress, levels, [], {
      gameId: 'math',
      levelId: first.id,
      lessonId: first.lessonIds[0],
      accuracy: 1,
      stars: 3,
      durationMs: 1000,
      skillIds: ['math-numero'],
      results: Array.from({ length: 4 }, (_, index) => ({
        activityId: `a-${index}`,
        correct: true,
        attempts: 1,
        timeMs: 80,
        hintsUsed: 0,
      })),
    })
    const stats = progress.stats as SubjectStats
    expect(stats.lessonsCompleted).toBe(1)
    expect(stats.skills?.['math-numero']?.sessions).toBe(1)
    expect(progress.unlockedLevelIds).toEqual([first.id])
    expect(progress.lessonProgress[first.lessonIds[1]]?.unlocked).toBe(true)
  })
})
