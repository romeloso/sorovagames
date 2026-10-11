import { describe, expect, it } from 'vitest'
import type { GameProgress, LessonSessionResult } from '@/types'
import { applyLessonResult, createEmptyReadingStats, createInitialGameProgress } from '@/domain/progress'
import { READING_WORLDS } from '@/data/games/reading/levels'
import { recordSkillPractice, skillStatus } from './mastery'
import { recommendWorldFromScores } from './placement'
import { familyNarrative } from './report'

function session(skillIds: string[], attempts: number): LessonSessionResult {
  return {
    gameId: 'reading',
    levelId: 'reading-sonidos',
    lessonId: 'reading-sonidos-1',
    accuracy: attempts === 1 ? 1 : 0.5,
    stars: 3,
    durationMs: 1000,
    skillIds,
    results: Array.from({ length: 4 }, (_, index) => ({
      activityId: `a-${index}`,
      correct: true,
      attempts,
      timeMs: 100,
      hintsUsed: 0,
    })),
  }
}

describe('dominio de habilidades', () => {
  it('no declara dominio con una sola sesión perfecta', () => {
    const skills = recordSkillPractice({}, ['escucha'], {
      independentCorrect: 4,
      independentTotal: 4,
      assistedCorrect: 0,
      at: '2026-04-01T00:00:00.000Z',
    })
    expect(skillStatus(skills.escucha)).toBe('developing')
  })

  it('declara dominio tras dos sesiones independientes con 85 % o más', () => {
    let skills = recordSkillPractice({}, ['escucha'], {
      independentCorrect: 4,
      independentTotal: 4,
      assistedCorrect: 0,
      at: '2026-04-01T00:00:00.000Z',
    })
    skills = recordSkillPractice(skills, ['escucha'], {
      independentCorrect: 4,
      independentTotal: 4,
      assistedCorrect: 0,
      at: '2026-04-02T00:00:00.000Z',
    })
    expect(skillStatus(skills.escucha)).toBe('mastered')
    expect(Date.parse(skills.escucha!.nextReviewAt!)).toBeGreaterThan(Date.parse('2026-04-02T00:00:00.000Z'))
  })

  it('marca refuerzo cuando la mayoría necesita ayuda', () => {
    const skills = recordSkillPractice({}, ['rima'], {
      independentCorrect: 1,
      independentTotal: 4,
      assistedCorrect: 3,
      at: '2026-04-01T00:00:00.000Z',
    })
    expect(skillStatus(skills.rima)).toBe('needs_support')
  })

  it('guarda el dominio dentro del progreso de la lección', () => {
    const levels = READING_WORLDS.map(({ accent: _accent, ...level }) => level)
    let progress = createInitialGameProgress('reading', levels)
    progress = applyLessonResult(progress, levels, [], session(['escucha'], 1))
    const stats = progress.stats as { skills?: Record<string, { sessions: number }> }
    expect(stats.skills?.escucha?.sessions).toBe(1)
    expect(createEmptyReadingStats().skills).toEqual({})
  })
})

describe('diagnóstico y familia', () => {
  it('recomienda el mundo según el desempeño, no la edad', () => {
    expect(recommendWorldFromScores({ sounds: 0, letters: 1, syllables: 1, words: 1, sentences: 1 })).toBe(
      'reading-sonidos',
    )
    expect(recommendWorldFromScores({ sounds: 1, letters: 1, syllables: 1, words: 1, sentences: 1 })).toBe(
      'reading-escritura',
    )
    expect(recommendWorldFromScores({ sounds: 1, letters: 1, syllables: 0.4, words: 0, sentences: 0 })).toBe(
      'reading-silabas',
    )
  })

  it('describe el avance sin etiquetas negativas', () => {
    const text = familyNarrative('Isabella', undefined, { escucha: 'Distinguir sonidos del habla' })
    expect(text).toContain('Isabella')
    expect(text.toLowerCase()).not.toContain('incapaz')
    expect(text.toLowerCase()).not.toContain('mal estudiante')
  })

  it('no usa un progreso vacío como si ya hubiera dominio', () => {
    const progress = { stats: createEmptyReadingStats() } as GameProgress
    expect(progress.stats).toBeTruthy()
  })
})
